import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { i18Text } from "@/locales/i8n";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";

const FontSizeSetting = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="fontSize"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start rounded-md p-2 shadow setting-item">
          <FormLabel>{i18Text("fontSizeSetting")}</FormLabel>
          <FormControl>
            <Tabs value={field.value} onValueChange={field.onChange}>
              <TabsList className="w-[120px]">
                <TabsTrigger value="14px">小</TabsTrigger>
                <TabsTrigger value="16px">中</TabsTrigger>
                <TabsTrigger value="18px">大</TabsTrigger>
              </TabsList>
            </Tabs>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default FontSizeSetting;
