import { http, HttpResponse } from 'msw';

// 其他杂项 API handlers

export const miscHandlers = [
  // 模拟其他API
  http.get('https://api.example.com/products', () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 1, name: "产品A", price: 299, category: "电子产品" },
        { id: 2, name: "产品B", price: 199, category: "服装" },
        { id: 3, name: "产品C", price: 399, category: "家居用品" }
      ]
    });
  }),
]; 