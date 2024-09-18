import { CheckIcon } from "@radix-ui/react-icons";

type ColorSelectProps = {
  color: string;
  onChange: (color: string) => void;
};
const ColorSelect = (props: ColorSelectProps) => {
  const defaultColor = [
    "#cd6155",
    "#ec7063",
    "#af7ac5",
    "#5dade2",
    "#48c9b0",
    "#f7dc6f",
    "#f8c471",
  ];
  function changeColor(color) {
    if (color) {
      props.onChange(color);
    }
  }
  return (
    <div className={"flex flex-row justify-between items-center w-full"}>
      {defaultColor.map((color) => {
        return (
          <>
            <div
              key={color}
              className={
                "w-6 h-6 rounded-md flex items-center justify-center cursor-pointer"
              }
              onClick={() => changeColor(color)}
              style={{ backgroundColor: color, boxShadow: color === props.color ? `0px 0px 10px ${color}` : 'none' }}
            >
              {color === props.color ? (
                <CheckIcon color={"#fff"}></CheckIcon>
              ) : (
                ""
              )}
            </div>
          </>
        );
      })}
    </div>
  );
};

export default ColorSelect;
