import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import OpenSetting from "@/popup/settings/openSetting";
import SelectColorSetting from "@/popup/settings/selectColorSetting";
import LanguageSetting from "@/popup/settings/languageSetting";
import FontSizeSetting from "@/popup/settings/fontSizeSetting";
import CacheSetting from "@/popup/settings/cacheSetting";
import { setChromeStorage } from "@/background/util";
import { useEffect } from "react";
import ThemeSetting from "@/popup/settings/themeSetting";

const formSchema = z.object({
  key: z.string(),
  isOpen: z.boolean(),
  language: z.string(),
  selectColor: z.string(),
  fontSize: z.string(),
  indexedDbCacheDay: z.string(),
});
type SettingFormProps = {
  config: SettingConfig;
};
type FormValues = z.infer<typeof formSchema>;
function updateSetting(data: FormValues) {
  setChromeStorage(data.key, data);
  console.log("set config", data);
}

const SettingForm = ({ config }: SettingFormProps) => {
  console.log(config, "配置信息");
  const defaultValues: Partial<FormValues> = {
    ...config,
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.watch(() => {
      updateSetting(form.getValues());
    });
  }, []);

  return (
    <Form {...form}>
      <form className="space-y-2 p-2">
        <OpenSetting form={form}></OpenSetting>
        <ThemeSetting form={form}></ThemeSetting>
        <SelectColorSetting form={form}></SelectColorSetting>
        <LanguageSetting form={form}></LanguageSetting>
        <FontSizeSetting form={form}></FontSizeSetting>
        <CacheSetting form={form}></CacheSetting>
      </form>
    </Form>
  );
};

export default SettingForm;
