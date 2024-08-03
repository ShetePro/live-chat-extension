import { createDocumentEl } from "../../utils/util";

export function createSwitch(value = false, config) {
  const { change } = config;
  const checkbox = createDocumentEl("input", { classList: ["toggle-switch"] });
  const span = createDocumentEl("span", { classList: ["slider"] });
  const label = createDocumentEl("label", {
    classList: ["switch"],
    append: [checkbox, span],
  });
  checkbox.type = "checkbox";
  checkbox.checked = value;
  checkbox.addEventListener("change", (e) => {
    change(e);
  });
  return label;
}
