import { setupServer } from 'msw/node';
import { handlers } from '@mock/handlers';

// 创建服务器端的mock服务器
export const server = setupServer(...handlers); 