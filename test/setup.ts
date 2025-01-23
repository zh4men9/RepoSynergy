// Mock Electron
jest.mock('electron', () => ({
  app: {
    getPath: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
  },
  ipcMain: {
    on: jest.fn(),
    handle: jest.fn(),
  },
  BrowserWindow: jest.fn().mockImplementation(() => ({
    loadURL: jest.fn(),
    on: jest.fn(),
    show: jest.fn(),
    webContents: {
      on: jest.fn(),
      send: jest.fn(),
    },
  })),
}));

// Mock electron-store
jest.mock('electron-store', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  }));
});

// Mock Node.js modules
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
  },
}));

jest.mock('path', () => ({
  join: jest.fn(),
  resolve: jest.fn(),
}));

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    repos: {
      list: jest.fn(),
      get: jest.fn(),
    },
    users: {
      getAuthenticated: jest.fn(),
    },
  })),
}));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

afterAll(() => {
  // Add any global cleanup here
  jest.clearAllMocks();
}); 