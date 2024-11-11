import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { i18Text } from "@/locales/i8n";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {UseFormReturn} from "react-hook-form";

const CacheSetting = ({ form }: { form: UseFormReturn }) => {
  const unitText = i18Text("dayUnit");
  return (
    <FormField
      control={form.control}
      name="indexedDbCacheDay"
      render={({ field }) => (
        <FormItem className="flex flex-col gap-1 justify-between items-start rounded-md border p-2 shadow">
          <FormLabel>{i18Text("indexedDbCacheSetting")}</FormLabel>
          <FormDescription>
            {i18Text("indexedDbCacheSettingDescription")}
          </FormDescription>
          <FormControl>
            <Tabs
              className={"w-full text-right"}
              value={field.value}
              onValueChange={field.onChange}
            >
              <TabsList className="w-[200px]">
                <TabsTrigger className={"flex-1"} value="1">
                  1{unitText}
                </TabsTrigger>
                <TabsTrigger className={"flex-1"} value="2">
                  2{unitText}
                </TabsTrigger>
                <TabsTrigger className={"flex-1"} value="3">
                  3{unitText}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default CacheSetting;
