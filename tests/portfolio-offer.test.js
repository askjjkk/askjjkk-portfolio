import test from "node:test";
import assert from "node:assert/strict";
import { projects, services } from "../src/data/content.js";
import { buildRequest, validateRequest } from "../src/components/request.js";

test("бизнес-сайты открывают витрину, старые проекты сохранены", () => {
  assert.deepEqual(
    projects.slice(0, 3).map((project) => project.id),
    ["kktatoo", "heating", "bio"],
  );
  assert.equal(projects.length, 8);
  assert.ok(projects.find((project) => project.id === "umbra"));
  assert.ok(projects.find((project) => project.id === "axiom"));
});

test("четыре веб-проекта имеют реальные кадры и прямую демонстрацию", () => {
  for (const id of ["kktatoo", "heating", "bio", "modsmith"]) {
    const project = projects.find((item) => item.id === id);
    assert.equal(project.screenshots.length, 3);
    assert.ok(
      project.links.some(
        (link) =>
          link.label === "Посмотреть сайт" && link.url.startsWith("https://"),
      ),
    );
  }
  assert.match(
    projects.find((project) => project.id === "heating").status,
    /Демо/,
  );
});

test("пакет 7900 ₽ можно выбрать, его условия включены в заявку", () => {
  const service = services.find((item) => item.id === "pilot");
  assert.equal(service.price, 7900);
  const request = {
    contact: "test@example.com",
    service: "pilot",
    description: "Сайт для мастера",
  };
  assert.deepEqual(validateRequest(request), {});
  const text = buildRequest(request);
  for (const part of [
    "7 900",
    "пяти блоков",
    "один круг правок",
    "Материалы",
    "Домен и хостинг",
  ]) {
    assert.ok(text.includes(part), `Условие отсутствует: ${part}`);
  }
});
