module.exports = function (number) {
  io.on("connection", (socket) => {
    console.log("User connect!");
    socket.on("disconnect", () => {
      console.log("user disconnect");
    });

    //  socket.emit("id", socket.id);
    //  console.log(socket.id);

    socket.on("room", function (room) {
      // console.log(clients);
      console.log(`Room: ${room}`);
      // console.log(socket.rooms);
      socket.join(room);
    });

    //idRoom = 'admin_TN'
    socket.on("roomAdmin", function (room) {
      //  admin join room
      console.log(`roomAdmin: ${room}`);
      // console.log(socket.rooms);
      socket.join(room);
    });

    // room web
    //idRoom = 'room_web'
    // socket.on("roomWeb", function (room) {
    //   //  admin join room
    //   console.log("roomWeb: " + room);
    //   // console.log(socket.rooms);
    //   socket.join(room);
    // });

    //idRoom = 'admin_permission'
    socket.on("roomAdminPermission", function (room) {
      //  admin join room
      console.log(`roomAdminPermission: ${room}`);
      // console.log(socket.rooms);
      socket.join(room);
    });

    socket.on("roomAdminById", function (room) {
      //  admin join room
      console.log(`roomAdminById: ${room}`);
      // console.log(socket.rooms);
      socket.join(room);
    });
  });
};
