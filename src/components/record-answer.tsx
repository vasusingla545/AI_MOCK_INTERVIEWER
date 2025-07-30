/* eslint-disable @typescript-eslint/no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  Video,
  VideoOff,
  WebcamIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { generateContent } from "@/scripts";
import { SaveModal } from "./save-model";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    error,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    speechRecognitionProperties: {
      lang: 'en-US',
      interimResults: true,
    },
  });

  // Check if Speech Recognition is supported
  const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [webcamRef, setWebcamRef] = useState<WebCam | null>(null);

  const { userId } = useAuth();
  const { interviewId } = useParams();

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      if (userAnswer?.length < 30) {
        toast.error("Error", {
          description: "Your answer should be more than 30 characters",
        });

        return;
      }

      //   ai result
      const aiResult = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );

      setAiResult(aiResult);
    } else {
      startSpeechToText();
    }
  };

  const cleanJsonResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse> => {
    setIsAiGenerating(true);
    const prompt = `
      Question: "${qst}"
      User Answer: "${userAns}"
      Correct Answer: "${qstAns}"
      Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
      Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).
    `;

    try {
      const aiResult = await generateContent(prompt);

      const parsedResult: AIResponse = cleanJsonResponse(aiResult);
      return parsedResult;
    } catch (error) {
      console.log(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" };
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    setAiResult(null);
    stopSpeechToText();
    // Force clear the results by restarting speech recognition
    setTimeout(() => {
      startSpeechToText();
      stopSpeechToText();
    }, 100);
  };

  const toggleWebcam = async () => {
    if (!isWebCam) {
      try {
        // Request camera permissions explicitly
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: "user"
          } 
        });
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        setIsWebCam(true);
        toast.success("Camera activated");
      } catch (error) {
        console.log("Camera permission error:", error);
        toast.error("Camera Permission", {
          description: "Please allow camera access in your browser settings"
        });
      }
    } else {
      setIsWebCam(false);
    }
  };

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult) {
      return;
    }

    const currentQuestion = question.question;
    try {
      // query the firbase to check if the user answer already exists for this question

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      // if the user already answerd the question dont save it again
      if (!querySnap.empty) {
        console.log("Query Snap Size", querySnap.size);
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      } else {
        // save the user answer

        await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: userAnswer,
          feedback: aiResult.feedback,
          rating: aiResult.ratings,
          userId,
          createdAt: serverTimestamp(),
        });

        toast("Saved", { description: "Your answer has been saved.." });
      }

      setUserAnswer("");
      stopSpeechToText();
    } catch (error) {
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      console.log(error);
    } finally {
      setLoading(false);
      setOpen(!open);
    }
  };

  useEffect(() => {
    const combineTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    // Only update if we have results and not currently recording
    if (combineTranscripts && !isRecording && userAnswer === "") {
      // Remove any live speech markers when setting final result
      setUserAnswer(combineTranscripts.replace(/\[Live:.*?\]/g, '').trim());
    }
  }, [results, isRecording, userAnswer]);

  // Update userAnswer with interimResult for real-time display
  useEffect(() => {
    console.log('Interim result:', interimResult, 'Recording:', isRecording);
    if (interimResult && isRecording) {
      setUserAnswer(prev => {
        // Get the base answer without any interim results
        const baseAnswer = prev.replace(/\[Live:.*?\]/g, '').trim();
        return baseAnswer + (baseAnswer ? ' ' : '') + `[Live: ${interimResult}]`;
      });
    }
  }, [interimResult, isRecording]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      {/* save modal */}
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

             <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
         {isWebCam ? (
           <WebCam
             ref={setWebcamRef}
             onUserMedia={() => {
               console.log("Webcam started successfully");
               setIsWebCam(true);
             }}
             onUserMediaError={(error) => {
               console.log("Webcam error:", error);
               setIsWebCam(false);
               toast.error("Webcam Error", {
                 description: "Please check camera permissions and try again"
               });
             }}
             className="w-full h-full object-cover rounded-md"
             audio={false}
             mirrored={true}
             screenshotFormat="image/jpeg"
             videoConstraints={{
               width: 640,
               height: 480,
               facingMode: "user"
             }}
           />
         ) : (
           <div className="flex flex-col items-center gap-2">
             <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
             <p className="text-sm text-muted-foreground">Camera not active</p>
           </div>
         )}
       </div>

      <div className="flex itece justify-center gap-3">
                 <TooltipButton
           content={isWebCam ? "Turn Off" : "Turn On"}
           icon={
             isWebCam ? (
               <VideoOff className="min-w-5 min-h-5" />
             ) : (
               <Video className="min-w-5 min-h-5" />
             )
           }
           onClick={toggleWebcam}
         />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
          disbaled={!isSpeechRecognitionSupported}
        />

        <TooltipButton
          content="Reset Answer"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
          disbaled={isRecording || !userAnswer}
        />

        <TooltipButton
          content="Save Result"
          icon={
            isAiGenerating ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(!open)}
          disbaled={!aiResult}
        />
      </div>

      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold">Your Answer:</h2>

        <p className="text-sm mt-2 text-gray-700 whitespace-normal">
          {userAnswer || "Start recording to see your answer here"}
        </p>

        {isRecording && interimResult && (
          <p className="text-sm text-blue-500 mt-2">
            <strong>Live Speech:</strong> {interimResult}
          </p>
        )}

        {isRecording && !interimResult && (
          <p className="text-sm text-blue-500 mt-2">
            <strong>Recording...</strong> Speak now to see live transcription
          </p>
        )}

        {!isSpeechRecognitionSupported && (
          <div className="mt-4">
            <textarea
              placeholder="Type your answer here (speech recognition not available in this browser)"
              className="w-full p-2 border rounded-md"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              rows={4}
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 mt-2">
            <strong>Error:</strong> {error}
          </p>
        )}

        <p className="text-sm text-gray-500 mt-2">
          <strong>Recording Status:</strong> {isRecording ? "Recording..." : "Not Recording"}
        </p>
        
        <p className="text-sm text-gray-500 mt-2">
          <strong>Results Count:</strong> {results.length}
        </p>

        {!isSpeechRecognitionSupported && (
          <p className="text-sm text-red-500 mt-2">
            <strong>Browser Not Supported:</strong> Speech recognition only works in Chrome, Edge, or Safari
          </p>
        )}
      </div>
    </div>
  );
};
