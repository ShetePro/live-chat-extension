import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import OpenSetting from "@/popup/settings/openSetting";
import SelectColorSetting from "@/popup/settings/selectColorSetting";
import LanguageSetting from "@/popup/settings/languageSetting";
import FontSizeSetting from "@/popup/settings/fontSizeSetting";
import CacheSetting from "@/popup/settings/cacheSetting";
import { setChromeStorage, watchChromeStorage } from "@/background/util";

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
function updateSetting(data: SettingConfig) {
  setChromeStorage(data.key, data);
  console.log("set config", data);
}
let form;

const SettingForm = ({ config }: SettingFormProps) => {
  console.log(config, "配置信息");
  const defaultValues: Partial<FormValues> = {
    ...config,
  };
  if (!form) {
    form = useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues,
      mode: "onChange",
    });
    form.watch(() => {
      const data: SettingConfig = form?.getValues();
      updateSetting(data);
    });
  }

  console.log("render setting form", form);
  return (
    <Form {...form}>
      <form className="space-y-2 p-2">
        <OpenSetting form={form}></OpenSetting>
        <SelectColorSetting form={form}></SelectColorSetting>
        <LanguageSetting form={form}></LanguageSetting>
        <FontSizeSetting form={form}></FontSizeSetting>
        <CacheSetting form={form}></CacheSetting>
      </form>
    </Form>
  );
};

export default SettingForm;
