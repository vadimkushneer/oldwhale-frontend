import { cloneBlocks, type ScriptBlock, uid } from "./scriptBlock";

function makeScene(sceneText: string, castText: string, extra: ScriptBlock[]): ScriptBlock[] {
  return [
    { id: uid(), type: "scene", text: sceneText },
    { id: uid(), type: "cast", text: castText },
    ...extra,
  ];
}

export function buildInitialBlocks(): Record<string, ScriptBlock[]> {
  return {
    film: makeScene("ИНТ. КОФЕЙНЯ. ДЕНЬ.", "МАРИНА (28)", [
      {
        id: uid(),
        type: "action",
        text: "Небольшое уютное место. За угловым столиком — МАРИНА (28), сценарист. Ноутбук и остывший кофе.",
      },
      { id: uid(), type: "char", text: "МАРИНА" },
      { id: uid(), type: "dialogue", text: "Почему каждая история начинается с кофейни?" },
      { id: uid(), type: "action", text: "Она смотрит в окно. На улице идёт дождь." },
    ]),
    play: [
      { id: uid(), type: "act", text: "АКТ ПЕРВЫЙ" },
      { id: uid(), type: "scene", text: "" },
      { id: uid(), type: "cast", text: "ВЕРНЕР, БАРБАРА" },
      {
        id: uid(),
        type: "stage",
        text: "Кухня в квартире. Вернер стоит у окна, Барбара сидит за столом. Долгое молчание.",
      },
      { id: uid(), type: "line", name: "ВЕРНЕР", text: "Этой весной." },
      { id: uid(), type: "line", name: "БАРБАРА", text: "Этой весной?!" },
      { id: uid(), type: "line", name: "ВЕРНЕР", text: "Да, этой весной." },
      { id: uid(), type: "stage", text: "Молчание." },
      {
        id: uid(),
        type: "line",
        name: "БАРБАРА",
        text: "Я не понимаю, ты всё ещё надеешься на положительный результат?",
      },
      { id: uid(), type: "line", name: "ВЕРНЕР", text: "Уже пять часов утра." },
    ],
    short: [
      { id: uid(), type: "video", text: "Видео 1" },
      {
        id: uid(),
        type: "hook",
        text: "Ты тратишь 3 часа на сценарий который можно написать за 20 минут.",
      },
      {
        id: uid(),
        type: "body",
        text: "Показываем редактор. Три шага.\nИдея → Структура → Готово.",
      },
      { id: uid(), type: "cta", text: "Ссылка в описании. Первый сценарий бесплатно." },
    ],
    media: [
      { id: uid(), type: "segment", text: "ОТКРЫТИЕ  |  0:00 – 1:30" },
      {
        id: uid(),
        type: "anchor",
        text: "Добрый вечер. В эфире — программа «Точка зрения». Сегодня мы говорим о том, как меняется язык кино.",
      },
      {
        id: uid(),
        type: "sync",
        text: "Кино всегда говорило на языке своего времени. Сейчас этот язык меняется быстрее, чем мы успеваем осмыслить.",
      },
      {
        id: uid(),
        type: "vtr",
        text: "[ВТР] Архивные съёмки. Старые кинозалы. Новые стриминги. 45 сек.",
      },
      { id: uid(), type: "segment", text: "ИНТЕРВЬЮ  |  1:30 – 8:00" },
      {
        id: uid(),
        type: "anchor",
        text: "У нас в гостях режиссёр, сценарист и продюсер. Расскажите — с чего всё начинается?",
      },
      {
        id: uid(),
        type: "sync",
        text: "Всегда с вопроса. Не с ответа — с вопроса, на который у тебя пока нет слов.",
      },
      { id: uid(), type: "lower3", text: "[ПЛАШКА] Имя Фамилия / Режиссёр" },
    ],
    note: [],
  };
}

export function freshInit(mode: string): ScriptBlock[] {
  const all = buildInitialBlocks();
  return cloneBlocks(all[mode] || all.film);
}
