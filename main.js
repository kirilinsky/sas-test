document.addEventListener("DOMContentLoaded", function () {
  const title = document.getElementById("title");
  const userSection = document.getElementById("user");
  const anonSection = document.getElementById("anon");
  const emailElement = document.getElementById("email");
  const lastLoginAtElement = document.getElementById("date");
  const signinButton = document.getElementById("signin");
  const logoutButton = document.getElementById("logout");

  /**
   * renders user (signed in) view
   * @param {Object} userInfo - The user information object.
   * @param {string} userInfo.email - The user's email address.
   */
  function renderUser(userInfo) {
    const { email: userEmail } = userInfo;
    anonSection.style.display = "none";
    userSection.style.display = "block";
    title.textContent = `Hello, you're signed in!`;
    emailElement.textContent = `Your email: ${userEmail}`;
    lastLoginAtElement.textContent = `Last logged in at: ${new Date().toLocaleString()}`;
  }

  /**
   * renders anon view
   */
  function renderAnon() {
    anonSection.style.display = "block";
    userSection.style.display = "none";
    title.textContent = "Wanna sign in?";
  }

  /**
   * wrapper function to handle chrome calls
   * @param {boolean} interactive - Whether the call should be interactive.
   * @param {Function} callback - The callback function to execute after getting the token.
   */
  function chromeIdentityWrapper(interactive, callback) {
    chrome.identity.getAuthToken({ interactive }, (token) => {
      if (token) {
        callback();
      }
    });
  }

  /**
   * init the user session by checking authentication status.
   */
  function initSession() {
    chromeIdentityWrapper(true, () => {
      chrome.identity.getProfileUserInfo(
        { accountStatus: "ANY" },
        (userInfo) => {
          if (userInfo.email) {
            renderUser(userInfo);
          } else {
            renderAnon();
          }
        }
      );
    });
  }

  /**
   * logs the user out by clearing cached authentication token.
   */
  function logout() {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          renderAnon();
        });
      }
    });
  }

  signinButton.addEventListener("click", initSession);
  logoutButton.addEventListener("click", logout);

  // init the session on load
  chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, (userInfo) => {
    if (userInfo.email) {
      renderUser(userInfo);
    } else {
      renderAnon();
    }
  });
});
