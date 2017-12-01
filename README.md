#Finding Right Number

###Client side

HTML5, CSS3, Bootstrap and Font awesome
JQuery
Socket.io client

###Server side

Node JS
Express JS
Socket.io server
Handlebars.js

###Luật chơi
1. Mỗi người chơi có thể tạo phòng chơi mới hoặc join vào những phòng đã tạo sẵn.

a. Tạo phòng chơi mới
Người chơi có thể gõ tên của mình vào form tạo phòng chơi mới. Hệ thống sẽ sinh ra một chuỗi ký tự ngẫu nhiên.
Người chơi có thể gửi chuỗi ký tự này đến những người bạn của mình để cho thể chơi chung.

b. Join vào phòng đã tạo
Người chơi nhập key của phòng và tên của mình vào ô Join phòng

2. Phòng có thể bắt đầu khi số người chơi từ 2 trở lên. Chỉ có người tạo phòng mới có thể bắt đầu trò chơi.
Số lượng thành viên trong phòng không giới hạn.
Trong khi trò chơi chưa được bắt đầu, mọi người có key của phòng đều có thể vào phòng.
Nếu phòng đã bắt đầu chơi, người dùng không thể vào phòng đó được.

3. Chương trình sẽ hiện ra một bảng gồm 16 số và một phép tính.
Người chơi chọn kết quả phép tính cho rằng là đúng. 
Nếu kết quả này sai, người chơi có thể chọn tiếp đáp án khác.
Nếu kết quả đúng, người chơi sẽ +1 điểm và chương trình sẽ hiện ra phép toán khác. Đồng thời ô chứa kết quả đúng vừa rồi không được chọn nữa.

4. Khi tất cả các ô đều đã được chọn đúng, người có điểm số cao nhất sẽ là người chiến thắng.
Người chơi có thể tự ý rời phòng bất kỳ lúc nào.
Khi phòng đang chơi chỉ còn lại 1 người, người đó là người chiến thắng.

Chúc các bạn chơi vui vẻ
