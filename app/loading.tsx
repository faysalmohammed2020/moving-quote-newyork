import { LoaderCircle } from "lucide-react";

const Loading: React.FC = () => {
  return (
    <div className="h-full flex justify-center items-center gap-2">
      <LoaderCircle className="size-10 animate-spin text-cyan-600" />
      <span className="text-lg">Loading...</span>
    </div>
  );
};

export default Loading;

// interface LoadingProps {
//     color?: string;
//   }

//   const Loading: React.FC<LoadingProps> = ({ color = "text-cyan-600" }) => {
//     return (
//       <div className="h-full flex justify-center items-center gap-2">
//         <LoaderCircle className={`size-10 animate-spin ${color}`} />
//         <span className="text-lg">Loading...</span>
//       </div>
//     );
//   };
