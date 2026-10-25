const firebaseConfig = {
  apiKey: "AIzaSyDAJJHRfSydFUS_jGYIjWOQ2Ts_fEfrq0Q",
  authDomain: "jhared-portfolio.firebaseapp.com",
  projectId: "jhared-portfolio",
  appId: "1:308250295117:web:ed4ea036203e53906d504,measurementld:G-CG7N2Y6K6J"
};

const dialog = document.getElementById("authDialog");
const form = document.getElementById("authForm");
const message = document.getElementById("authMsg");
const submitButton = document.getElementById("authSubmit");

const isReady =
  typeof firebase !== "undefined" && Object.values(firebaseConfig).every(Boolean);

let auth = null;
let mode = "login";

if (isReady) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
}

function showMessage(text, good = false) {
  message.textContent = text;
  message.className = "msg " + (good ? "ok" : "bad");
}

function friendlyError(code) {
  const errors = {
    "auth/invalid-email": "That email doesn’t look right.",
    "auth/missing-password": "Enter your password.",
    "auth/weak-password": "Use a password with at least 6 characters.",
    "auth/email-already-in-use": "That email already has an account. Try logging in.",
    "auth/invalid-credential": "Wrong email or password.",
    "auth/user-not-found": "Wrong email or password.",
    "auth/wrong-password": "Wrong email or password.",
    "auth/too-many-requests": "Too many tries. Wait a few minutes and try again.",
    "auth/network-request-failed": "No internet connection. Check it and try again."
  };
  return errors[code] || "Something went wrong,please try again";
}

function showNotReady() {
  showMessage("Login isn’t set up yet. Add your Firebase settings in auth.js.");
}

function setMode(newMode) {
  mode = newMode;
  const isSignup = mode === "signup";

  document.getElementById("tabLogin").classList.toggle("active", !isSignup);
  document.getElementById("tabSignup").classList.toggle("active", isSignup);
  document.getElementById("authTitle").textContent = isSignup ? "Sign up" : "Log in";
  document.getElementById("nameRow").hidden = !isSignup;
  document.getElementById("forgot").hidden = isSignup;
  document.getElementById("authPass").autocomplete = isSignup ? "new-password" : "current-password";

  submitButton.textContent = isSignup ? "Create account" : "Log in";
  message.textContent = "";
}

document.getElementById("openAuth").addEventListener("click", () => {
  if (typeof setMenu === "function") setMenu(false);
  setMode("login");
  dialog.showModal();
  if (!isReady) showNotReady();
});

document.getElementById("closeAuth").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

document.getElementById("tabLogin").addEventListener("click", () => setMode("login"));
document.getElementById("tabSignup").addEventListener("click", () => setMode("signup"));

async function signUp(email, password, name) {
  const result = await auth.createUserWithEmailAndPassword(email, password);
  if (name) await result.user.updateProfile({ displayName: name });
}

async function logIn(email, password) {
  await auth.signInWithEmailAndPassword(email, password);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!isReady) return showNotReady();

  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPass").value;
  const name = document.getElementById("authName").value.trim();

 if (!email || !password) return showMessage("Enter your email and password.");

  submitButton.disabled = true;
  showMessage("One moment…", true);

  try {
    if (mode === "signup") await signUp(email, password, name);
    else await logIn(email, password);

    form.reset();
    dialog.close();
  } catch (error) {
    showMessage(friendlyError(error.code));
  } finally {
    submitButton.disabled = false;
  }
});

document.getElementById("forgot").addEventListener("click", async () => {
  if (!isReady) return showNotReady();

  const email = document.getElementById("authEmail").value.trim();
  if (!email) return showMessage("Type your email above first.");

  try {
    await auth.sendPasswordResetEmail(email);
    showMessage("If an account exists for that email, a reset link was sent.", true);
  } catch (error) {
    showMessage(friendlyError(error.code));
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  if (auth) auth.signOut();
});

function updateMenu(user) {
  document.getElementById("loggedOut").hidden = !!user;
  document.getElementById("loggedIn").hidden = !user;

  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    document.getElementById("userName").textContent = "Hi, " + name;
  }
}

if (auth) auth.onAuthStateChanged(updateMenu);
const passInput = document.getElementById("authPass");
const toggleButton = document.getElementById("togglePass");

function showPassword(show) {
  passInput.type = show ? "text" : "password";
  toggleButton.classList.toggle("on", show);
  toggleButton.setAttribute("aria-label", show ? "Hide password" : "Show password");
}

toggleButton.addEventListener("click", () => {
  showPassword(passInput.type === "password");
});

dialog.addEventListener("close", () => showPassword(false));