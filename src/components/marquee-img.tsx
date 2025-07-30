interface MarqueImgProps {
  img: string;
}

export const MarqueImg = ({ img }: MarqueImgProps) => {
  return (
    <div className="mx-4">
      <img src={img} alt="" className="h-12 w-auto object-contain" />
    </div>
  );
};
  