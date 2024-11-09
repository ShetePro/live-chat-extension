import { Skeleton } from "@/components/ui/skeleton";

const EmptyForm = () => {
  return (
    <div className="flex flex-col space-y-3 mt-2">
      <Skeleton className="h-8 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-[80px] w-full"/>
        <div className={'flex flex-row gap-1'}>
          <Skeleton className="h-8 w-1/2"/>
          <Skeleton className="h-8 w-1/2"/>
        </div>
        <div className={'flex flex-row gap-1'}>
          <Skeleton className="h-8 w-1/3 flex-1"/>
          <Skeleton className="h-8 w-[40px]"/>
          <Skeleton className="h-8 w-[40px]"/>
          <Skeleton className="h-8 w-[40px]"/>
        </div>
        <Skeleton className="h-[80px] w-full"/>
      </div>
    </div>
  );
};

export default EmptyForm;
