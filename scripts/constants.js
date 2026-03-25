// scripts/constants.js

// ========== КОНСТАНТЫ ==========
// Дерево
const TREE_COLOR = 0xA67C52;
const TREE_HEIGHT = 20;
const TEXTURE_SCALE_Y = 1.5;
const MAIN_RADIUS = 0.8;
const MAIN_DIAMETER = MAIN_RADIUS * 2;

// Параметры изгиба ствола
const TRUNK_CURVE_STRENGTH = 0.5; // Сила максимального изгиба ствола
const TRUNK_SEGMENTS = 12; // Количество сегментов на весь ствол (больше = более плавный изгиб)

// Ветки
const BRANCH_MIN_RADIUS = 0.1; // Минимальная толщина ветки у основания
const BRANCH_MAX_RADIUS = 0.3; // Максимальная толщина ветки у основания
const BRANCH_MIN_LENGTH = 2; // Минимальная длина ветки
const BRANCH_MAX_LENGTH = 3; // Максимальная длина ветки
const BRANCH_ANGLE_MIN = 0.2; // Минимальный угол наклона ветки (от горизонтали)
const BRANCH_ANGLE_MAX = 0.5; // Максимальный угол наклона ветки (от горизонтали)
const BRANCH_CURVE_STRENGTH = 0.5; // Сила изгиба ветки
const BRANCH_SEGMENTS = 5; // Количество сегментов для изогнутой ветки

// Параметры хвои (иголок)
const NEEDLE_COUNT_PER_BRANCH = 3; // Количество пучков хвои на ветку
const NEEDLE_TEXTURE_PATH = 'textures/needle.png'; // Путь к текстуре хвои с альфа-каналом
const NEEDLE_SIZE = 1.5; // Размер плоскости с хвоей
const NEEDLE_COLOR_VARIATION = 0.2; // Вариация цвета хвои (0-1)

// Выступы и площадки на дереве
const STICK_OUT = 0.1 * MAIN_DIAMETER;
const PLATFORM_RADIUS = 0.5;
const PLATFORM_HEIGHT = 0.2;
const CYLINDER_HALF_HEIGHT = TREE_HEIGHT / 2;
const PLATFORM_DENSITY = 0.6;
const PLATFORM_COUNT = Math.floor(TREE_HEIGHT * PLATFORM_DENSITY);
const PLATFORM_DISTANCE = 1.3;

// Базовая платформа
const BASE_PLATFORM_SIZE = 40;
const BASE_PLATFORM_TOP_Y = -CYLINDER_HALF_HEIGHT;

// Шарик
const BALL_RADIUS = 0.15;

// Физика шарика
const GRAVITY = -7.5;
const BOUNCE_SPEED = 7;
const MAX_VELOCITY = 5.2;

// Камера
const CAMERA_FOLLOW_SPEED = 0.06;
const CAMERA_HEIGHT_OFFSET = 4;
const CAMERA_START_Y = -CYLINDER_HALF_HEIGHT;

// Управление мышью
const ROTATION_SPEED = 0.025;
const ROTATION_SMOOTH = 0.5;
const INERTIA = 0.6;

// Цвета
const BALL_COLOR = 0xff6b6b;
const AMBIENT_LIGHT_COLOR = 0x88FFFF;
const KEY_LIGHT_COLOR = 0xffffff;
const FILL_LIGHT_COLOR = 0x63a188;
const RIM_LIGHT_COLOR = 0x818cf8;
const WIREFRAME_COLOR = 0xC4956A;
const BACKGROUND_COLOR = 0xBBBBFF;

// Свет
const AMBIENT_LIGHT_INTENSITY = 1;
const KEY_LIGHT_INTENSITY = 3;
const FILL_LIGHT_INTENSITY = 2;
const RIM_LIGHT_INTENSITY = 0.6;
const RIM_LIGHT_DISTANCE = 12;

// Пути к текстурам
const BARK_TEXTURE_PATH = 'textures/bark.jpg';
const BARK_NORMAL_PATH = 'textures/bark-normal.jpg';
const PLATFORM_TEXTURE_PATH = 'textures/platform.jpg';
const KILLER_PLATFORM_TEXTURE_PATH = 'textures/killer_platform.jpg';
const BACKGROUND_IMAGE_PATH = 'images/bk1.jpg';
const GRASS_IMAGE_PATH = 'textures/grass-s.png';
const GROUND_IMAGE_PATH = 'textures/ground.jpg';

// Игровые параметры
const GAME_OVER_Y_OFFSET = -7; // Смещение относительно камеры для конца игры
const RESET_POSITION_X = 0;
const RESET_POSITION_Z = MAIN_RADIUS * 1.3;
const RESET_POSITION_Y = BASE_PLATFORM_TOP_Y + BALL_RADIUS;
const RESET_VELOCITY_Y = BOUNCE_SPEED;

// Цвета для платформ
const PLATFORM_NORMAL_COLOR = 0xA67C52; // Используем существующий TREE_COLOR для обычных платформ
const PLATFORM_KILLER_COLOR = 0xFF3333; // Ярко-красный для платформ-убийц

// Звания пользователей - ИНДЕКСЫ для локализации
const USER_TITLES = {
    Novice: {
        step: 500
    },
    Warrior: {
        step: 800
    },
    Knight: {
        step: 1000
    },
    Lord: {
        step: 1200
    },
    Legend: {
        step: 1500
    },
}

const START_GAME = 'TEST';

// Параметры игры - ИНДЕКСЫ для локализации названий уровней
const GAME_PARAMS = {
    TEST: {
        NAME: 'difficulty_test', // Индекс для локализации
        ENV: {
            BACKGROUND_COLOR: 0xBBBBFF,
            KEY_LIGHT_COLOR: 0xffffff,
            RIM_LIGHT_COLOR: 0x818cf8,
            FILL_LIGHT_COLOR: 0x63a188,
            BACKGROUND_IMAGE_PATH: 'images/bk1.jpg',
            GRASS_IMAGE_PATH: 'textures/grass-s.png',
            GROUND_IMAGE_PATH:'textures/ground.jpg',
            AMBIENT_LIGHT_INTENSITY: 1,
            KEY_LIGHT_INTENSITY: 3,
            FILL_LIGHT_INTENSITY: 2,
            RIM_LIGHT_INTENSITY: 0.6
        },
        TREE: {
            BARK_TEXTURE_REPEAT: {x: 4, y: 1},
            BARK_TEXTURE_PATH: 'textures/oak-bark.jpg',
            BARK_NORMAL_PATH: 'textures/bark-d-normal.jpg',
            PLATFORM_TEXTURE_PATH: 'textures/platform.jpg',
            KILLER_PLATFORM_TEXTURE_PATH: 'textures/lava.jpg',
            NEEDLE_TEXTURE_PATH: 'textures/oak-leaves.png',
            BRANCH_DENSITY: 0.4,
            TREE_HEIGHT: 10,
            PLATFORM_STEP: 1,
            KILLER_DENSITY: 0,
            KILLER_SPEED: 0,
            PLATFORM_SPEED: 0,
            PLATFORM_ROTATE_DENSITY: 0,
            PLATFORM_RADIUS: { MIN: 0.5, MAX: 0.5 },
            RADIAL_PLATFORM_STEP: [1, 0.4, 4] 
            // 0-1 Случаность, шаг ступени в рад., минимальное кол-во последовательных ступеней 
        }
    },
    START: {
        NAME: 'difficulty_start', // Индекс для локализации
        ENV: {
            BACKGROUND_COLOR: 0xBBBBFF,
            KEY_LIGHT_COLOR: 0xffffff,
            RIM_LIGHT_COLOR: 0x818cf8,
            FILL_LIGHT_COLOR: 0x63a188,
            BACKGROUND_IMAGE_PATH: 'images/bk1.jpg',
            GRASS_IMAGE_PATH: 'textures/grass-s.png',
            GROUND_IMAGE_PATH:'textures/ground.jpg',
            AMBIENT_LIGHT_INTENSITY: 1,
            KEY_LIGHT_INTENSITY: 3,
            FILL_LIGHT_INTENSITY: 2,
            RIM_LIGHT_INTENSITY: 0.6
        },
        TREE: {
            BARK_TEXTURE_REPEAT: {x: 4, y: 1},
            BARK_TEXTURE_PATH: 'textures/oak-bark.jpg',
            BARK_NORMAL_PATH: 'textures/bark-d-normal.jpg',
            PLATFORM_TEXTURE_PATH: 'textures/platform.jpg',
            KILLER_PLATFORM_TEXTURE_PATH: 'textures/lava.jpg',
            NEEDLE_TEXTURE_PATH: 'textures/oak-leaves.png',
            BRANCH_DENSITY: 0.8,
            TREE_HEIGHT: 12,
            PLATFORM_STEP: 1.4,
            KILLER_DENSITY: 0.1,
            KILLER_SPEED: 1,
            PLATFORM_SPEED: 0.1,
            PLATFORM_ROTATE_DENSITY: 0.1,
            PLATFORM_RADIUS: { MIN: 0.5, MAX: 0.5 },
            RADIAL_PLATFORM_STEP: [0.8, 0.4, 3] 
        }
    },
    DARK: {
        NAME: 'difficulty_dark', // Индекс для локализации
        ENV: {
            BACKGROUND_COLOR: 0x7a96df,
            KEY_LIGHT_COLOR: 0xffffff,
            RIM_LIGHT_COLOR: 0x818cf8,
            FILL_LIGHT_COLOR: 0x63a188,
            BACKGROUND_IMAGE_PATH: 'images/dark-bg.jpg',
            GRASS_IMAGE_PATH: 'textures/grass-s.png',
            GROUND_IMAGE_PATH:'textures/ground.jpg',
            AMBIENT_LIGHT_INTENSITY: 1,
            KEY_LIGHT_INTENSITY: 3,
            FILL_LIGHT_INTENSITY: 2,
            RIM_LIGHT_INTENSITY: 0.6
        },
        TREE: {
            BARK_TEXTURE_REPEAT: {x: 2, y: 1},
            BARK_TEXTURE_PATH: 'textures/pine-bark.jpg',
            BARK_NORMAL_PATH: 'textures/bark-normal.jpg',
            PLATFORM_TEXTURE_PATH: 'textures/platform.jpg',
            KILLER_PLATFORM_TEXTURE_PATH: 'textures/lava.jpg',
            NEEDLE_TEXTURE_PATH: 'textures/needle.png',
            BRANCH_DENSITY: 0.8,
            TREE_HEIGHT: 15,
            PLATFORM_STEP: 1.6,
            KILLER_DENSITY: 0.2,
            KILLER_SPEED: 1,
            PLATFORM_SPEED: 0.15,
            PLATFORM_ROTATE_DENSITY: 0.25,
            PLATFORM_RADIUS: { MIN: 0.45, MAX: 0.5 },
            RADIAL_PLATFORM_STEP: [0.5, 0.4, 3] 
        }
    },
    BIRCH: {
        NAME: 'difficulty_birch', // Индекс для локализации
        ENV: {
            BACKGROUND_COLOR: 0xBBBBFF,
            KEY_LIGHT_COLOR: 0xffffff,
            RIM_LIGHT_COLOR: 0x818cf8,
            FILL_LIGHT_COLOR: 0x63a188,
            BACKGROUND_IMAGE_PATH: 'images/bk1.jpg',
            GRASS_IMAGE_PATH: 'textures/grass-s.png',
            GROUND_IMAGE_PATH:'textures/ground.jpg',
            AMBIENT_LIGHT_INTENSITY: 0.5,
            KEY_LIGHT_INTENSITY: 3,
            FILL_LIGHT_INTENSITY: 2,
            RIM_LIGHT_INTENSITY: 0.6
        },
        TREE: {
            BARK_TEXTURE_REPEAT: {x: 2, y: 1},
            BARK_TEXTURE_PATH: 'textures/birch.jfif',
            BARK_NORMAL_PATH: 'textures/bark-d-normal.jpg',
            PLATFORM_TEXTURE_PATH: 'textures/platform.jpg',
            KILLER_PLATFORM_TEXTURE_PATH: 'textures/lava.jpg',
            NEEDLE_TEXTURE_PATH: 'textures/birch-leaves.png',
            BRANCH_DENSITY: 1,
            TREE_HEIGHT: 20,
            PLATFORM_STEP: 1.6,
            KILLER_DENSITY: 0.3,
            KILLER_SPEED: 1.2,
            PLATFORM_SPEED: 0.2,
            PLATFORM_ROTATE_DENSITY: 0.3,
            PLATFORM_RADIUS: { MIN: 0.4, MAX: 0.45 }
        }
    },
    MIDDLE: {
        NAME: 'difficulty_middle', // Индекс для локализации
        ENV: {
            BACKGROUND_COLOR: 0xBBBBFF,
            KEY_LIGHT_COLOR: 0xffffff,
            RIM_LIGHT_COLOR: 0x818cf8,
            FILL_LIGHT_COLOR: 0x63a188,
            BACKGROUND_IMAGE_PATH: 'images/bk1.jpg',
            GRASS_IMAGE_PATH: 'textures/grass-s.png',
            GROUND_IMAGE_PATH:'textures/ground.jpg',
            AMBIENT_LIGHT_INTENSITY: 1,
            KEY_LIGHT_INTENSITY: 3,
            FILL_LIGHT_INTENSITY: 2,
            RIM_LIGHT_INTENSITY: 0.6
        },
        TREE: {
            BARK_TEXTURE_REPEAT: {x: 4, y: 1},
            BARK_TEXTURE_PATH: 'textures/oak-bark.jpg',
            BARK_NORMAL_PATH: 'textures/bark-d-normal.jpg',
            PLATFORM_TEXTURE_PATH: 'textures/platform.jpg',
            KILLER_PLATFORM_TEXTURE_PATH: 'textures/lava.jpg',
            NEEDLE_TEXTURE_PATH: 'textures/oak-leaves.png',
            BRANCH_DENSITY: 1,
            TREE_HEIGHT: 17,
            PLATFORM_STEP: 1.6,
            KILLER_DENSITY: 0.35,
            KILLER_SPEED: 1.4,
            PLATFORM_SPEED: 0.25,
            PLATFORM_ROTATE_DENSITY: 0.4,
            PLATFORM_RADIUS: { MIN: 0.35, MAX: 0.45 }
        }
    },
    DIFICULT: {
        NAME: 'difficulty_hard', // Индекс для локализации
        ENV: {
            BACKGROUND_COLOR: 0x7a96df,
            KEY_LIGHT_COLOR: 0xffffff,
            RIM_LIGHT_COLOR: 0x818cf8,
            FILL_LIGHT_COLOR: 0x63a188,
            BACKGROUND_IMAGE_PATH: 'images/dark-bg.jpg',
            GRASS_IMAGE_PATH: 'textures/grass-s.png',
            GROUND_IMAGE_PATH:'textures/ground.jpg',
            AMBIENT_LIGHT_INTENSITY: 1,
            KEY_LIGHT_INTENSITY: 3,
            FILL_LIGHT_INTENSITY: 2,
            RIM_LIGHT_INTENSITY: 0.6
        },
        TREE: {
            BARK_TEXTURE_REPEAT: {x: 2, y: 1},
            BARK_TEXTURE_PATH: 'textures/pine-bark.jpg',
            BARK_NORMAL_PATH: 'textures/bark-normal.jpg',
            PLATFORM_TEXTURE_PATH: 'textures/platform.jpg',
            KILLER_PLATFORM_TEXTURE_PATH: 'textures/lava.jpg',
            NEEDLE_TEXTURE_PATH: 'textures/needle.png',
            BRANCH_DENSITY: 1,
            TREE_HEIGHT: 20,
            PLATFORM_STEP: 1.6,
            KILLER_DENSITY: 0.4,
            KILLER_SPEED: 1.5,
            PLATFORM_SPEED: 0.3,
            PLATFORM_ROTATE_DENSITY: 0.5,
            PLATFORM_RADIUS: { MIN: 0.3, MAX: 0.4 }
        }
    },
    NIGHTMARE: {
        NAME: 'difficulty_nightmare', // Индекс для локализации
        ENV: {
            BACKGROUND_COLOR: 0xBBBBFF,
            KEY_LIGHT_COLOR: 0xffffff,
            RIM_LIGHT_COLOR: 0x818cf8,
            FILL_LIGHT_COLOR: 0x63a188,
            BACKGROUND_IMAGE_PATH: 'images/bk1.jpg',
            GRASS_IMAGE_PATH: 'textures/grass-s.png',
            GROUND_IMAGE_PATH:'textures/ground.jpg',
            AMBIENT_LIGHT_INTENSITY: 0.5,
            KEY_LIGHT_INTENSITY: 3,
            FILL_LIGHT_INTENSITY: 2,
            RIM_LIGHT_INTENSITY: 0.6
        },
        TREE: {
            BARK_TEXTURE_REPEAT: {x: 2, y: 1},
            BARK_TEXTURE_PATH: 'textures/birch.jfif',
            BARK_NORMAL_PATH: 'textures/bark-d-normal.jpg',
            PLATFORM_TEXTURE_PATH: 'textures/platform.jpg',
            KILLER_PLATFORM_TEXTURE_PATH: 'textures/lava.jpg',
            NEEDLE_TEXTURE_PATH: 'textures/birch-leaves.png',
            BRANCH_DENSITY: 1,
            TREE_HEIGHT: 25,
            PLATFORM_STEP: 1.65,
            KILLER_DENSITY: 0.7,
            KILLER_SPEED: 1.6,
            PLATFORM_SPEED: 0.35,
            PLATFORM_ROTATE_DENSITY: 0.7,
            PLATFORM_RADIUS: { MIN: 0.3, MAX: 0.4 }
        }
    }
}