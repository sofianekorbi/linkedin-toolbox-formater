console.log("🚀 LinkedIn Formateur Toolbox - Background Script chargé");
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("✅ Extension installée avec succès");
  } else if (details.reason === "update") {
    console.log("🔄 Extension mise à jour");
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({ status: "pong" });
  }
  return true;
});
//# sourceMappingURL=background.js.map
