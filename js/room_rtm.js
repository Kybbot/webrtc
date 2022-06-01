const handleMemberJoined = async (MemberId) => {
	addMemberToDom(MemberId);

	const members = await channel.getMembers();
	updateMemberTotal(members);

	let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);
	addBotMessageToDom(`Welcome to the room ${name}! 👋`);
}

const addMemberToDom = async (MemberId) => {
	let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ["name"]);

	const membersWrapper = document.getElementById("member__list");
	const memberItem = `
		<div class="member__wrapper" id="member__${MemberId}__wrapper">
			<span class="green__icon"></span>
			<p class="member_name">${name}</p>
		</div>
	`;

	membersWrapper.insertAdjacentHTML("beforeend", memberItem);
}

const updateMemberTotal = async (members) => {
	const total = document.getElementById("members__count");
	total.innerHTML = members.length;
}


const handleMemberLeft = async (MemberId) => {
	removeMemberFromDom(MemberId);

	const members = await channel.getMembers();
	updateMemberTotal(members);
}

const removeMemberFromDom = async (MemberId) => {
	const memberWrapper = document.getElementById(`member__${MemberId}__wrapper`);
	let name = memberWrapper.getElementsByClassName("member_name")[0].textContent;
	memberWrapper.remove();

	addBotMessageToDom(`${name} has left the room.`);
}

const getMembers = async () => {
	let members = await channel.getMembers();
	updateMemberTotal(members);
	for (let i = 0; members.length > i; i++) {
		addMemberToDom(members[i]);
	}
}

const handleChannelMessage = async (messageData, MemberId) => {
	let data = JSON.parse(messageData.text);

	if (data.type === "chat") {
		addMessageToDom(data.displayName, data.message);
	}
	
	if (data.type === "user_left") {
		document.getElementById(`user-container-${data.uid}`).remove();

		if (userIdInDisplayFrame === `user-container-${uid}`) {
			displayFrame.style.display = null;
	
			for (let i = 0; videoFrames.length > i; i++) {
				videoFrames[i].style.height = "300px";
				videoFrames[i].style.width = "300px";
			}
		}
	}
}

const sendMessage = async (e) => {
	e.preventDefault();

	let message = e.target.message.value;
	channel.sendMessage({text: JSON.stringify({
		"type": "chat",
		"message": message,
		"displayName": displayName
	})});
	addMessageToDom(displayName, message);
	e.target.reset();
}

const addMessageToDom = (name, message) => {
	const messageWrapper = document.getElementById("messages");
	const newMessage = `
		<div class="message__wrapper">
			<div class="message__body">
				<strong class="message__author">${name}</strong>
				<p class="message__text">${message}</p>
			</div>
		</div>
	`;

	messageWrapper.insertAdjacentHTML("beforeend", newMessage);

	const lastMessage = document.querySelector("#messages .message__wrapper:last-child");
	if (lastMessage) {
		lastMessage.scrollIntoView();
	}
}

const addBotMessageToDom = (botMessage) => {
	const messageWrapper = document.getElementById("messages");
	const newMessage = `
		<div class="message__wrapper">
			<div class="message__body__bot">
				<strong class="message__author__bot">🤖 Mumble Bot</strong>
				<p class="message__text__bot">${botMessage}</p>
			</div>
		</div>
	`;

	messageWrapper.insertAdjacentHTML("beforeend", newMessage);

	const lastMessage = document.querySelector("#messages .message__wrapper:last-child");
	if (lastMessage) {
		lastMessage.scrollIntoView();
	}
}

const leaveChanel = async () => {
	await channel.leave();
	await rtmClient.logout();
}

window.addEventListener("beforeunload", leaveChanel);

let messageForm = document.getElementById("message__form");

messageForm.addEventListener("submit", sendMessage);