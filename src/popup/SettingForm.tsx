import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { i18Text } from "@/locales/i8n";
import { ExtensionConfig } from "@/background/config";
import ColorSelect from "@/components/color-select/ColorSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
const formSchema = z.object({
  isOpen: z.boolean(),
  language: z.string(),
  selectColor: z.string(),
});
const SettingForm = () => {
  const form = useForm<SettingConfig>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...ExtensionConfig,
    },
  });
  console.log("render setting form");
  console.log(form.getValues());
  return (
    <Form {...form}>
      <form className="space-y-2 p-2">
        <FormField
          control={form.control}
          name="isOpen"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start rounded-md p-2 shadow setting-item">
              <FormLabel>{i18Text("isOpen")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="selectColor"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-1 justify-between items-start rounded-md border p-2 shadow">
              <FormLabel>{i18Text("selectColorText")}</FormLabel>
              <FormDescription>
                {i18Text("selectColorDescription")}
              </FormDescription>
              <FormControl>
                <ColorSelect
                  color={field.value}
                  onChange={field.onChange}
                ></ColorSelect>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start rounded-md p-2 shadow setting-item">
              <FormLabel>{i18Text("languages")}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cn">中文</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fontSize"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start rounded-md p-2 shadow setting-item">
              <FormLabel>{i18Text("fontSizeSetting")}</FormLabel>
              <FormControl>
                <Tabs defaultValue={field.value} >
                  <TabsList className="w-[120px]" onChange={field.onChange}>
                    <TabsTrigger value="14px">小</TabsTrigger>
                    <TabsTrigger value="16px">中</TabsTrigger>
                    <TabsTrigger value="18px">大</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
            </FormItem>
          )}
        />
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
                <Tabs className={'w-full text-right'} defaultValue={field.value} >
                  <TabsList className="w-[200px] " onChange={field.onChange}>
                    <TabsTrigger className={'flex-1'} value="1">1{i18Text('dayUnit')}</TabsTrigger>
                    <TabsTrigger className={'flex-1'} value="2">2{i18Text('dayUnit')}</TabsTrigger>
                    <TabsTrigger className={'flex-1'} value="3">3{i18Text('dayUnit')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default SettingForm;
