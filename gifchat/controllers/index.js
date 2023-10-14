const Room = require("../schemas/room");
const Chat = require("../schemas/chat");
const { removeRoom: remeveRoomService } = require("../services");
// 변수가 겹칠 수 있으니 변경.

exports.renderMain = async (req, res, next) => {
  try {
    const rooms = await Room.find({}); // 방 목록 전체 가져오기
    res.render("main", { rooms, title: "GIF 채팅방" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.renderRoom = (req, res) => {
  res.render("room", { title: "GIF 채팅방 생성" });
};

exports.createRoom = async (req, res, next) => {
  try {
    const newRoom = await Room.create({
      title: req.body.title,
      max: req.body.max,
      owner: req.session.color,
      password: req.body.password,
    });
    const io = req.app.get("io");
    io.of("/room").emit("newRoom", newRoom); // maint.html의 newRoom이 실행
    // 방을 들어간가는 부분 if문 구절
    if (req.body.password) {
      // 비밀번호가 있으면 방 아이디 뒤에 비밀번호를 붙여준다. (비밀번호를 까먹었을까바 붙여줌)
      res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
    } else {
      res.redirect(`/room/${newRoom._id}`);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.enterRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    if (!room) {
      // 렌더링 전에 방이 존재하는지
      return res.redirect("/?error=존재하지 않는 방입니다.");
    }
    if (room.password && room.password !== req.query.password) {
      // 비밀방일 경우에는 비밀번호가 맞는지
      // 방에 비밀버호가 있는데, 방에 비밀번호랑 입력한 비밀번호가 다를 경우
      // res.redirect(`/room/${newRoom._id}?password=${req.body.password}`); 여기서 확인

      return res.redirect("/?error=비밀번호가 틀렸습니다.");
    }

    const io = req.app.get("io");
    //허용 인원을 초과하지는 않았는지 검사를 socket 갯수로 검사할 수 있다.
    const { rooms } = io.of("/chat").adapter; // .adapter을 사용하여 특정 방을 조회
    if (room.max <= rooms.get(req.params.id)?.size) {
      //  특정 방의 소켓 갯수 socket.join(data);가 max보다 크거나 같을 때
      return res.redirect("/?error=허용 인원을 초과했습니다.");
    }
    const chats = await Chat.find({ room: room._id }).sort("createdAt"); // 채팅을 찾고 시간순으로정렬 렌더링 해줌.
    return res.render("chat", {
      room,
      title: room.title,
      chats,
      user: req.session.color,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.removeRoom = async (req, res, next) => {
  try {
    // room부터 지우고, 방에 속한 모든 chat을 지운다. 서비스로 분리한 로직을 가져와 사용.
    await remeveRoomService(req.params.id);
    res.send("ok");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.sendChat = async (req, res, next) => {
  try {
    const chat = await Chat.create({
      // form에서 전달될 데이터들
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat,
    });
    // 채팅을 새로 만들었으면 실시간으로 전송
    req.app.get("io").of("/chat").to(req.params.id).emit("chat", chat); // chat네임스페이스에 먼저 들어간 다음, 그 방아이디 안의 소켓들에게만 그 채팅 내용을 보냄.
    res.send("ok");
    // 여기서 보낸게 chat.html 의 'chat'의 data로 보내진다.
  } catch (error) {
    console.error(error);
    next(error);
  }
};

exports.sendGif = async (req, res, next) => {
  try {
    const chat = await Chat.create({
      // form에서 전달될 데이터들
      room: req.params.id,
      user: req.session.color,
      gif: req.file.filename, // DB에는 파일이 아니라, 파일이름이 저장되야 함.
    });
    // 채팅을 새로 만들었으면 실시간으로 전송
    req.app.get("io").of("/chat").to(req.params.id).emit("chat", chat); // chat네임스페이스에 먼저 들어간 다음, 그 방아이디 안의 소켓들에게만 그 채팅 내용을 보냄.
    res.send("ok");
    // 여기서 보낸게 chat.html 의 'chat'의 data로 보내진다.
  } catch (error) {
    console.error(error);
    next(error);
  }
};
