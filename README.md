# ЗАВОД 2040
### Интерактивный атлас промышленного будущего

**[Открыть сайт](https://imonsergey.github.io/3dland/)** · [Сборки и публикации](https://github.com/IMONsergey/3dland/actions) · [Исследование арт-дирекшна](./DESIGN_RESEARCH.md)

«Завод 2040» — независимый демонстрационный проект о технологиях промышленности и связанных с ними киберфизических рисках. Исходная концепция: новая технология → новая зависимость → новый риск → принцип защиты. Один металлургический мир, три горизонта и 14 точек исследования.

## Визуальная архитектура

### 01. Фотореалистичный промосайт

Главная страница и четыре главы истории используют отдельные кинематографические изображения: промышленный комплекс, доменное производство, роботизированные линии, энергетический узел и OT-диспетчерская. Сцены сгенерированы в Adobe Firefly, отобраны по композиции, обработаны и оптимизированы в WebP. Это художественные изображения воображаемого предприятия, не фотографии реального объекта и не точные технические реконструкции.

Композиция строится вокруг одного кадра, крупной кириллической типографики, одной основной кнопки и тонких вспомогательных контролов. Глава сменяется прокруткой, стрелками, кнопками или свайпом, а изображение меняется плавно.

**Файлы:**
- src/components/PhotoStage.tsx — фотореалистичная главная и смена 2030/2035/2040.
- src/components/CinematicJourney.tsx — четыре главы кинематографического повествования.
- src/components/experience.css и src/components/journey.css — арт-дирекшн и адаптивы.
- public/renders/ — WebP-иллюстрации hero, furnace, robots, energy, network.
- public/og-preview.jpg — социальное превью.

Оригинальные большие PNG не хранятся в GitHub-репозитории. Резервная копия находится на авторизованном Mac в ~/Documents/3dland-render-source/source; рабочие WebP — в репозитории.

### 02. Свободное 3D-исследование

Отдельный режим загружает Three.js только после нажатия «Свободный 3D-обзор» или при открытии прямой ссылки на объект.

- Процедурная сцена металлургического предприятия с инженерными конструкциями, мостовым краном, транспортом, роботами, доменным комплексом, линией прокатки, подстанцией и водооборотом.
- Анимации механизмов, дронов, транспорта и производственных процессов.
- Выбор маркеров или кликабельных производственных объектов, вращение и приближение камеры.
- Переключение трёх эпох: 2030, 2035, 2040.
- Возможность и киберриск для каждого узла, подсветка связанных систем на сцене.
- Интерактивная 2D-схема для устройств без WebGL.

Файлы: IndustrialWorld.tsx, EngineeringDetail.tsx, CyberRiskOverlay.tsx, FallbackWorld.tsx.

### 03. Редакционный атлас

- **14 промышленных узлов и 42 сценария** с технологическим и киберфизическим слоями.
- Каталог с поиском, тематическими фильтрами, навигацией по узлам.
- Сравнение 2030 / 2035 / 2040.
- Разворачиваемая причинная цепочка риска: точка взаимодействия, граница доверия, последствия, защитные меры.
- Описание технологического оборудования и связанных систем.
- Фотореалистичные контекстные иллюстрации к статьям.
- Адаптивные версии для мобильных устройств и планшетов.

Файлы: Workbench.tsx, workbench.css, src/data/atlas.ts, extraNodes.ts, research.ts.

## Kaspersky brand alignment and authored 3D (October 2026)

- Applied the original Kaspersky white/black brand SVG lockups available in the authorized project workspace; the project title is a separate label, not an edited corporate logo.
- Added a brand-system stylesheet using the dark neutral B2B base, emerald/mint accents, restrained layout, Kaspersky Sans local-font detection and readable fallbacks. **No proprietary font files are embedded or redistributed.** Production delivery requires the approved webfont package and license from Kaspersky.
- Integrated an original Blender-authored industrial blast furnace GLB with steel plating, flanges, maintenance walkways and structural detail, plus licensed CC0 vehicle GLBs and Poly Haven PBR sets for concrete and corrugated steel. The scene remains a stylized industrial concept, not certified CAD or a photorealistic digital twin.
- Brand compliance evidence and unresolved approval requirements: [docs/KASPERSKY_BRAND_COMPLIANCE.md](docs/KASPERSKY_BRAND_COMPLIANCE.md). Asset origin and license scope: [docs/ASSET_PROVENANCE.md](docs/ASSET_PROVENANCE.md).
- The official [Kaspersky Brand Portal](https://brand.kaspersky.com/wiki/design_resources) lists the Visual Identity Guide, Web UI-kit and illustration resources. We could confirm the public listings, but not all normative asset-file contents. **Do not claim certified brandbook compliance** without an approved client handoff.

## Технологии

React 19, TypeScript, Vite 6, Three.js, React Three Fiber, Drei. Ассеты графики — WebP; код 3D-сцены и редакционный атлас загружаются отдельными JS-чанками. Предусмотрены reduced-motion и fallback без WebGL. Публикация автоматически запускается в GitHub Actions на ветке main.

## Запуск

Требуется Node.js 20+ и браузер с WebGL для 3D-режима.

    npm ci
    npm run dev -- --port 4317
    npm run build
    npm run preview

Тесты браузера (Playwright + Google Chrome):

    npm run test:smoke
    npm run test:premium
    npm run test:release

- test:smoke: базовые режимы, временные горизонты, экскурсия, атлас и сравнение.
- test:premium: визуальные контрольные снимки и функциональные сценарии на 1440, 1024 и 390 px.
- test:release: полнота 42 прогнозов и запасной режим без WebGL.
- test:design / test:deep: синонимы визуального регрессионного прогона.

Стандартный локальный адрес: http://127.0.0.1:4317/3dland/. Для другого Chrome можно передать CHROME_BIN.

## Ограничения

**Не полнофункциональная промплатформа.** Детально представлена только металлургия. Остальные пять отраслей отмечены в каталоге как запланированные.

**Не инженерный цифровой двойник.** Фотографические сцены являются AI-сгенерированными иллюстрациями; интерактивная геометрия стилизована. Фотография при переходе в 3D не превращается в ту же точную модель. Для единого цельного фотореалистичного 3D-мира нужны новые GLB-модели, PBR-материалы, UV, level of detail и независимый CGI-производственный пайплайн.

**Прогнозы — гипотезы.** Контент не является официальным прогнозом или рекомендацией Kaspersky. Для применения в клиентском проекте необходима проверка металлургами, промышленными инженерами и специалистами ICS/OT.

**CMS пока отсутствует.** Контент хранится в типизированных объектах репозитория, полноценные роли, черновики, публикации и версия контента потребуют бэкенда.

**Кейс не претендует на награду Awwwards.** Референсы служат ориентиром уровня режиссуры и качества, а не юридически переносимой библиотекой дизайна.

© I’MON — independent visual concept.
