// Tokens model

class Tokens {

  // constructor, source는 반드시 값이 존재해야됨
  constructor(source, accessToken = "", refreshToken = "") {
    if (!source) {
      throw new Error("Source is required.");
    }
    this._source = source; // private
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // "source" getter
  get source() {
    return this._source;
  }

  // "accessToken" getter와 setter
  getAccessToken() {
    return this.accessToken;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  // "refreshToken" getter와 setter
  getRefreshToken() {
    return this.refreshToken;
  }

  setRefreshToken(token) {
    this.refreshToken = token;
  }

  // 객체 형태로 변환하는 메서드 (Firestore에 저장하기 위해)
  toObject() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }
}

