import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { i18Text } from "@/locales/i8n";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {UseFormReturn} from "react-hook-form";

const ThemeSetting = ({ form }: { form: UseFormReturn }) => {
  return (
    <FormField
      control={form.control}
      name="theme"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start rounded-md p-2 shadow setting-item">
          <FormLabel>{i18Text("theme")}</FormLabel>
          <FormControl>
            <Tabs value={field.value} onValueChange={field.onChange}>
              <TabsList>
                <TabsTrigger value="system">
                  {i18Text("followSystem")}
                </TabsTrigger>
                <TabsTrigger value="dark">{i18Text("dark")}</TabsTrigger>
                <TabsTrigger value="light">{i18Text("light")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ThemeSetting;
