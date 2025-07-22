export interface OAuth2Config {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scope: string;
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  responseType?: string;
  state?: string;
}

export interface OAuth2Provider {
  name: string;
  displayName: string;
  icon?: string;
  config: OAuth2Config;
}

export interface OAuth2User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
}

export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class OAuth2Service {
  private provider: OAuth2Provider;

  constructor(provider: OAuth2Provider) {
    this.provider = provider;
  }

  /**
   * 生成授权URL
   */
  getAuthorizationUrl(): string {
    const { config } = this.provider;
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_type: config.responseType || 'code',
      ...(config.state && { state: config.state })
    });

    return `${config.authorizeUrl}?${params.toString()}`;
  }

  /**
   * 使用授权码获取访问令牌
   */
  async getAccessToken(code: string, state?: string): Promise<OAuth2TokenResponse> {
    const { config } = this.provider;
    
    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret || '',
        code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
        ...(state && { state })
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 使用访问令牌获取用户信息
   */
  async getUserInfo(accessToken: string): Promise<OAuth2User> {
    const { config } = this.provider;
    
    const response = await fetch(config.userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }

    const userInfo = await response.json();
    return this.transformUserInfo(userInfo);
  }

  /**
   * 转换用户信息格式（不同OAuth2服务器返回的用户信息格式不同）
   */
  private transformUserInfo(userInfo: any): OAuth2User {
    // 针对不同的OAuth2提供商进行不同的转换
    switch (this.provider.name) {
      case 'github':
        return {
          id: userInfo.id.toString(),
          name: userInfo.name || userInfo.login,
          email: userInfo.email,
          avatar: userInfo.avatar_url,
          provider: this.provider.name
        };
      case 'google':
        return {
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          avatar: userInfo.picture,
          provider: this.provider.name
        };
      case 'microsoft':
        return {
          id: userInfo.id,
          name: userInfo.displayName,
          email: userInfo.userPrincipalName || userInfo.mail,
          avatar: userInfo.photo,
          provider: this.provider.name
        };
      default:
        // 通用转换
        return {
          id: userInfo.id?.toString() || userInfo.sub,
          name: userInfo.name || userInfo.display_name || userInfo.displayName,
          email: userInfo.email || userInfo.mail,
          avatar: userInfo.avatar_url || userInfo.picture || userInfo.photo,
          provider: this.provider.name
        };
    }
  }

  /**
   * 完整的OAuth2登录流程
   */
  async login(code: string, state?: string): Promise<OAuth2User> {
    const tokenResponse = await this.getAccessToken(code, state);
    const userInfo = await this.getUserInfo(tokenResponse.access_token);
    return userInfo;
  }

  /**
   * 跳转到OAuth2授权页面
   */
  redirectToAuth(): void {
    const authUrl = this.getAuthorizationUrl();
    window.location.href = authUrl;
  }
}

// 预定义的OAuth2提供商配置
export const OAuth2Providers: Record<string, Omit<OAuth2Provider, 'config'>> = {
  github: {
    name: 'github',
    displayName: 'GitHub',
    icon: 'https://github.githubassets.com/favicons/favicon-dark.svg'
  },
  google: {
    name: 'google',
    displayName: 'Google',
    icon: 'https://developers.google.com/identity/images/g-logo.png'
  },
  microsoft: {
    name: 'microsoft',
    displayName: 'Microsoft',
    icon: 'https://docs.microsoft.com/favicon.ico'
  }
};

// OAuth2提供商工厂
export class OAuth2Factory {
  static createGitHubProvider(clientId: string, redirectUri: string): OAuth2Provider {
    return {
      ...OAuth2Providers.github,
      config: {
        clientId,
        redirectUri,
        scope: 'user:email',
        authorizeUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        userInfoUrl: 'https://api.github.com/user'
      }
    };
  }

  static createGoogleProvider(clientId: string, redirectUri: string): OAuth2Provider {
    return {
      ...OAuth2Providers.google,
      config: {
        clientId,
        redirectUri,
        scope: 'openid profile email',
        authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo'
      }
    };
  }

  static createMicrosoftProvider(clientId: string, redirectUri: string): OAuth2Provider {
    return {
      ...OAuth2Providers.microsoft,
      config: {
        clientId,
        redirectUri,
        scope: 'openid profile email',
        authorizeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me'
      }
    };
  }

  static createCustomProvider(
    name: string,
    displayName: string,
    config: OAuth2Config,
    icon?: string
  ): OAuth2Provider {
    return {
      name,
      displayName,
      icon,
      config
    };
  }
} 