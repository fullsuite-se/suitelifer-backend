import jwt from "jsonwebtoken";

const users = [
  { email: "hrtest@fullsuite.ph", password: "password", role: "admin" },
  { email: "employee@example.com", password: "password", role: "employee" },
];

export const login = (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = jwt.sign(
    { email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "5s" } // Change this to 1h for production
  );

  const refreshToken = jwt.sign(
    { email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "30s" } // Change this to 30d for production
  );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false, // Change this to true if using HTTPS
    sameSite: "Strict",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // Change this to true if using HTTPS
    sameSite: "Strict",
  });

  res.json({ accessToken });
};
export const logout = (req, res) => {
  res.cookie("accessToken", "", {
    httpOnly: true,
    secure: false, // Change this to true if using HTTPS
    sameSite: "Strict",
    path: "/",
    expires: new Date(0), // Expire immediately
  });

  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: false, // Change this to true if using HTTPS
    sameSite: "Strict",
    path: "/",
    expires: new Date(0),
  });

  res.json({ message: "Logged out successfully", isLoggedOut: true });
};

export const userInfo = (req, res) => {
  const user = req.user;
  res.json({ user: user });
};

export const refreshToken = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token missing" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    console.log(user);

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token data" });
    }

    const newAccessToken = jwt.sign(
      { email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "5s" } // Change this to 1h for production
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false, // Change this to true if using HTTPS
      sameSite: "Strict",
    });

    res.json({ accessToken: newAccessToken });
  });
};

// EXPERIMENTAL API
// export const getSpotifyToken = async code => {
//   // CODE VERIFIER
//   const generateRandomString = (length) => {
//     const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//     const values = crypto.getRandomValues(new Uint8Array(length));
//     return values.reduce((acc, x) => acc + possible[x % possible.length], "");
//   }

//   const codeVerifier = generateRandomString(64);

//   // CODE CHALLENGE
//   const sha256 = async (plain) => {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(plain);
//     return window.crypto.subtle.digest("SHA-256", data);
//   }

//   const base64encode = (input) => {
//     return btoa(String.fromCharCode(...new Uint8Array(input)))
//     .replace(/=/g, '')
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_');
//   }

//   const hashed = await sha256(codeVerifier);
//   const codeChallenge = base64encode(hashed);

//   const clientId = process.env.SPOTIFY_CLIENT_ID;
//   const redirectUri = "http://localhost:5173";

//   const scope = "user-read-private user-read-email";
//   const authUrl = new URL("https://accounts.spotify.com/authorize");

//   window.localStorage.setItem('code_verifier', codeVerifier);

//   const params = {
//     response_type: "code",
//     client_id: clientId,
//     scope,
//     code_challenge_method: "256",
//     code_challenge: codeChallenge,
//     redirectUri: redirectUri,
//   }

//   authUrl.search = new URLSearchParams(params).toString();
//   window.location.href = authUrl.toString();

//   const urlParams = new URLSearchParams(window.location.search);
//   var code = urlParams.get('code');
// }
