const prompt = document.querySelector("#prompt");
const chatContainer = document.querySelector(".chat-container");
let imageButton = document.querySelector("#image");
let imageInput = document.querySelector("#image input");

const Api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCqxwnPXwRbDnMCMQGjImtqH3ee8nXDaQY";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null
  },
  data: null 
};

async function generateResponse(aiChatBox) {
  
  const parts = [{ text: user.message }];
  if (user.file?.data) {
    parts.push({
      inline_data: {
        mime_type: user.file.mime_type,
        data: user.file.data
      }
    });
  }

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: parts
        }
      ],
      generationConfig: {
        stopSequences: ["Title"],
        temperature: 1.0,
        maxOutputTokens: 800,
        topP: 0.8,
        topK: 10
      }
    })
  };

  try {
    const response = await fetch(Api_url, requestOptions);
    const data = await response.json();

    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    aiChatBox.querySelector(".Ai-chat-area").textContent = aiReply;
  } catch (error) {
    console.error(error);
    aiChatBox.querySelector(".Ai-chat-area").textContent = "Error retrieving response.";
  } finally {
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
  }
}

function createChatbox(html, classes) {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handleChatResponse(message) {
  user.message = message;
  user.data = message; 

  const userHtml = `
    <img src="user.png" alt="User" id="user-image" width="50">
    <div class="user-chat-area">${user.data}</div>
  `;
 const lowerMessage = message.toLowerCase();
  if (
    lowerMessage.includes("play music") ||
    lowerMessage.includes("open spotify") ||
    lowerMessage.includes("start music")
  ) {
    
    setTimeout(() => {
      window.open("https://open.spotify.com", "_blank");
    }, 1000);
    
    return; 
  }
   if (
    lowerMessage.includes("play videos") ||
    lowerMessage.includes("open youtube") ||
    lowerMessage.includes("start youtube")
  ) {
    
    setTimeout(() => {
      window.open("https://www.youtube.com", "_blank");
    }, 1000);

    return; 
  }
  prompt.value = "";
  const userChatBox = createChatbox(userHtml, "user-chatbox");
  chatContainer.appendChild(userChatBox);

  chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    const aiHtml = `
      <img src="ai.png" alt="AI" id="ai-image" width="50">
      <div class="Ai-chat-area"></div>
    `;
    const aiChatBox = createChatbox(aiHtml, "Ai-chat-box");
    chatContainer.appendChild(aiChatBox);

    generateResponse(aiChatBox);
  }, 600);
}

prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && prompt.value.trim() !== "") {
    handleChatResponse(prompt.value);
  }
});

imageInput.addEventListener("change", () => {
 const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Data = e.target.result.split(",")[1]; 
    const imageUrl = e.target.result; 

    
    user.file = {
      mime_type: file.type,
      data: base64Data
    };
    user.message = "Please analyze the uploaded image."; 
    user.data = "Image uploaded."; 

    
    const userHtml = `
      <img src="user.png" alt="User" id="user-image" width="50">
      <div class="user-chat-area">
        <p>${user.data}</p>
        <img src="${imageUrl}" alt="Uploaded Image" style="max-width: 200px; border-radius: 8px; margin-top: 5px;">
      </div>
    `;
    const userChatBox = createChatbox(userHtml, "user-chatbox");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    
    setTimeout(() => {
      const aiHtml = `
        <img src="ai.png" alt="AI" id="ai-image" width="50">
        <div class="Ai-chat-area"></div>
      `;
      const aiChatBox = createChatbox(aiHtml, "Ai-chat-box");
      chatContainer.appendChild(aiChatBox);
      generateResponse(aiChatBox);
    }, 600);
  };

  reader.readAsDataURL(file);
});

imageButton.addEventListener("click", () => {
  imageInput.click();
});
