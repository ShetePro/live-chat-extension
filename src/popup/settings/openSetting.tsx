import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { i18Text } from "@/locales/i8n";
import { Switch } from "@/components/ui/switch";

const OpenSetting = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="isOpen"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start rounded-md p-2 shadow setting-item">
          <FormLabel>{i18Text("isOpen")}</FormLabel>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default OpenSetting;
