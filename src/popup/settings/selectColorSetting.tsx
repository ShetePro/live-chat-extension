import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { i18Text } from "@/locales/i8n";
import ColorSelect from "@/components/color-select/ColorSelect";

const SelectColorSetting = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="selectColor"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1 justify-between items-start rounded-md border p-2 shadow">
          <FormLabel>{i18Text("selectColorText")}</FormLabel>
          <FormDescription>{i18Text("selectColorDescription")}</FormDescription>
          <FormControl>
            <ColorSelect
              color={field.value}
              onChange={field.onChange}
            ></ColorSelect>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default SelectColorSetting;
