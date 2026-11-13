import test from "node:test";
import assert from "node:assert/strict";
import {
  validateRequest,
  buildRequest,
  buildMailto,
} from "../src/components/request.js";

const valid = {
  name: "Александр",
  contact: "hello@example.com",
  service: "landing",
  description: "Нужен сайт с примерами работ.",
};
test("обязательные поля и неизвестная услуга отклоняются", () => {
  assert.deepEqual(Object.keys(validateRequest({})), [
    "contact",
    "service",
    "description",
  ]);
  assert.ok(validateRequest({ ...valid, service: "unknown" }).service);
  assert.deepEqual(validateRequest({ ...valid, name: "" }), {});
});
test("для Minecraft нужны версия и платформа; для сайта они не нужны", () => {
  assert.deepEqual(
    Object.keys(validateRequest({ ...valid, service: "mc-mod" })),
    ["version", "platform"],
  );
  assert.deepEqual(
    validateRequest({
      ...valid,
      service: "mc-server",
      version: "1.21.1",
      platform: "Paper",
    }),
    {},
  );
  assert.deepEqual(validateRequest(valid), {});
});
test("mailto сохраняет кириллицу, переносы и специальные символы", () => {
  const data = {
    ...valid,
    description: "Сайт & бот?\nЦена = обсуждаем #проект + API",
  };
  const uri = new URL(buildMailto(data));
  assert.equal(uri.protocol, "mailto:");
  assert.equal(uri.pathname, "askjjkk03@gmail.com");
  assert.match(
    uri.searchParams.get("body"),
    /Сайт & бот\?\nЦена = обсуждаем #проект \+ API/,
  );
  assert.equal(
    uri.searchParams.get("subject"),
    "Обсуждение проекта: Сайт-визитка или лендинг",
  );
});
test("текст заявки не включает поля Minecraft для другой услуги", () => {
  assert.doesNotMatch(
    buildRequest({ ...valid, version: "1.21", platform: "Fabric" }),
    /Fabric|1\.21/,
  );
  assert.match(
    buildRequest({
      ...valid,
      service: "mc-mod",
      version: "1.21",
      platform: "Fabric",
    }),
    /Версия Minecraft: 1\.21\nПлатформа: Fabric/,
  );
  assert.ok(
    buildMailto({ ...valid, name: "\r\nBcc: bad@example.com" }).startsWith(
      "mailto:askjjkk03@gmail.com?",
    ),
  );
});
