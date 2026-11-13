import { services } from "../data/content.js";

const clean = (value) => String(value ?? "").trim();
export function validateRequest(data) {
  const errors = {};
  const service = services.find((item) => item.id === data.service);
  if (!clean(data.contact))
    errors.contact = "Укажите почту, телефон или Telegram для ответа.";
  if (!service) errors.service = "Выберите услугу из списка.";
  if (!clean(data.description))
    errors.description = "Опишите, какой результат вам нужен.";
  if (service?.minecraft) {
    if (!clean(data.version))
      errors.version =
        "Укажите версию Minecraft или напишите «нужна помощь с выбором».";
    if (!clean(data.platform))
      errors.platform =
        "Укажите платформу или напишите «нужна помощь с выбором».";
  }
  return errors;
}

export function buildRequest(data) {
  const service = services.find((item) => item.id === data.service);
  const lines = [
    "Здравствуйте, Александр!",
    "",
    `Услуга: ${service?.name ?? ""}`,
  ];
  if (clean(data.name)) lines.push(`Имя: ${clean(data.name)}`);
  if (service?.terms) lines.push(`Условия пакета: ${service.terms}`);
  lines.push(`Контакт для ответа: ${clean(data.contact)}`);
  if (service?.minecraft)
    lines.push(
      `Версия Minecraft: ${clean(data.version)}`,
      `Платформа: ${clean(data.platform)}`,
    );
  lines.push("", "Описание задачи:", clean(data.description));
  return lines.join("\n");
}

export function buildMailto(data) {
  const service = services.find((item) => item.id === data.service);
  return `mailto:askjjkk03@gmail.com?subject=${encodeURIComponent(`Обсуждение проекта: ${service?.name ?? ""}`)}&body=${encodeURIComponent(buildRequest(data))}`;
}
