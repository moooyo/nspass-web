/**
 * 国旗工具函数
 * 提供统一的国旗显示解决方案
 */

// @ts-ignore
import countryFlagEmoji from 'country-flag-emoji';

/**
 * 国旗工具函数
 */
export const flagUtils = {
  // 从第三方库获取所有国家数据
  allCountries: countryFlagEmoji.list,

  // 常用国家代码
  popularCountryCodes: [
    'CN', 'US', 'JP', 'DE', 'GB', 'FR', 'CA', 'AU', 'KR', 'SG', 
    'HK', 'TW', 'RU', 'IN', 'BR', 'NL', 'CH', 'SE', 'NO', 'IT'
  ],

  // 国家名称标准化映射
  countryNameMapping: {
    // 中文到英文映射
    '中国': 'China',
    '美国': 'United States',
    '日本': 'Japan',
    '德国': 'Germany',
    '新加坡': 'Singapore',
    '中国香港': 'Hong Kong',
    '香港': 'Hong Kong',
    '英国': 'United Kingdom',
    '法国': 'France',
    '加拿大': 'Canada',
    '澳大利亚': 'Australia',
    // 常见别名映射
    'USA': 'United States',
    'US': 'United States',
    'UK': 'United Kingdom',
    'JP': 'Japan',
    'DE': 'Germany',
    'SG': 'Singapore',
    'HK': 'Hong Kong',
    'CN': 'China',
    'AU': 'Australia',
    'CA': 'Canada',
    'FR': 'France'
  } as Record<string, string>,

  // 根据国家名称获取国家代码
  getCountryCodeByName: (countryName: string): string | null => {
    const country = flagUtils.allCountries.find((c: any) => c.name === countryName);
    return country ? country.code : null;
  },

  // 标准化国家名称
  standardizeCountryName: (countryName: string): string => {
    return flagUtils.countryNameMapping[countryName] || countryName;
  },

  // 根据国家名称获取国旗emoji
  getCountryFlag: (countryName?: string): string => {
    if (!countryName) return '🌍';
    
    // 先标准化国家名称
    const standardizedName = flagUtils.standardizeCountryName(countryName);
    
    // 尝试通过countryFlagEmoji库获取
    try {
      const countryData = countryFlagEmoji.get(standardizedName);
      if (countryData && countryData.emoji) {
        return countryData.emoji;
      }
    } catch (error) {
      console.warn(`无法获取国家 ${countryName} 的国旗`, error);
    }

    // 备用：直接通过国家代码获取
    const countryCode = flagUtils.getCountryCodeByName(standardizedName);
    if (countryCode) {
      try {
        const countryData = countryFlagEmoji.get(countryCode);
        if (countryData && countryData.emoji) {
          return countryData.emoji;
        }
      } catch (error) {
        console.warn(`无法通过国家代码 ${countryCode} 获取国旗`, error);
      }
    }

    // 默认返回地球图标
    return '🌍';
  },

  // 生成完整的国家选项列表（用于下拉框）
  getCountryOptions: () => {
    // 获取常用国家
    const popularCountries = flagUtils.popularCountryCodes
      .map(code => countryFlagEmoji.get(code))
      .filter(Boolean);
    
    // 获取其他国家（排除常用国家）
    const otherCountries = flagUtils.allCountries.filter((country: any) => 
      !flagUtils.popularCountryCodes.includes(country.code)
    );
    
    const createCountryOption = (country: any) => ({
      label: `${country.emoji} ${country.name}`,
      value: country.name,
      emoji: country.emoji,
      code: country.code
    });
    
    return [
      // 常用国家分组
      {
        label: '── 常用国家 ──',
        value: 'divider-popular',
        disabled: true
      },
      ...popularCountries.map(createCountryOption),
      // 其他国家分组
      {
        label: '── 其他国家 ──',
        value: 'divider-others', 
        disabled: true
      },
      ...otherCountries.map(createCountryOption)
    ];
  }
};

// 兼容性导出
export const getCountryFlag = flagUtils.getCountryFlag;
export const getCountryCodeByName = flagUtils.getCountryCodeByName;
export const standardizeCountryName = flagUtils.standardizeCountryName;
export const getCountryOptions = flagUtils.getCountryOptions;
