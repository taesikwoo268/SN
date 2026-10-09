Milestone 3 — Hoàn thiện User và Media
- 13D: Upload avatar bằng multipart/form-data.
- 13E: Kiểm tra MIME type, kích thước và file signature.
- 13F: Media storage abstraction:
  - Local storage bằng Bun.file/Bun.write khi development.
  - Chuẩn bị interface để chuyển sang S3/R2.
- 13G: Trả avatarUrl, không làm lộ avatarKey.
- 13H: Xóa avatar cũ và xử lý orphan file.
- 13I: Tối ưu tìm kiếm bằng PostgreSQL pg_trgm.
Milestone 4 — Social graph
Thiết kế quan hệ kiểu Facebook:
- 14A: Thiết kế bảng friend_requests.
- 14B: Gửi lời mời kết bạn.
- 14C: Chấp nhận hoặc từ chối lời mời.
- 14D: Hủy lời mời đã gửi.
- 14E: Danh sách bạn bè.
- 14F: Hủy kết bạn.
- 14G: Chặn và bỏ chặn người dùng.
- 14H: Chống duplicate request và race condition bằng constraint/transaction.
- 14I: Cursor pagination cho danh sách bạn bè.
Milestone 5 — Posts và media bài viết
- 15A: Thiết kế bảng posts.
- 15B: Quyền riêng tư:
  - public
  - friends
  - private
- 15C: Tạo bài viết.
- 15D: Xem chi tiết bài viết.
- 15E: Sửa bài viết với ownership authorization.
- 15F: Soft delete bài viết.
- 15G: Upload nhiều ảnh.
- 15H: Bảng post_media và thứ tự ảnh.
- 15I: Kiểm tra quyền xem bài viết.
Milestone 6 — Tương tác
- 16A: Reaction/like bài viết.
- 16B: Bỏ reaction hoặc đổi reaction.
- 16C: Comment bài viết.
- 16D: Reply comment.
- 16E: Sửa và xóa comment.
- 16F: Đếm reaction/comment hiệu quả.
- 16G: Xử lý concurrent update.
Milestone 7 — Newsfeed
Đây là phần kiến trúc quan trọng nhất của mạng xã hội.
- 17A: Feed đơn giản bằng fan-out on read.
- 17B: Query bài viết của user và bạn bè.
- 17C: Cursor pagination theo (createdAt, id).
- 17D: Tránh N+1 query.
- 17E: Quy tắc visibility.
- 17F: Phân tích fan-out on read và fan-out on write.
- 17G: Thêm Redis cache.
- 17H: Feed ranking cơ bản.
- 17I: Cache invalidation khi tạo/xóa bài viết.
Giai đoạn MVP sẽ bắt đầu bằng fan-out on read; chỉ chuyển sang fan-out on write khi đã đo được bottleneck.
Milestone 8 — Notification và realtime
- 18A: Thiết kế bảng notification.
- 18B: Notification khi có friend request.
- 18C: Notification khi bài viết được like/comment.
- 18D: Đánh dấu đã đọc.
- 18E: Bun native WebSocket.
- 18F: Xác thực WebSocket bằng session cookie.
- 18G: Redis Pub/Sub khi chạy nhiều API instance.
- 18H: Reconnect và đồng bộ notification bị bỏ lỡ.
Milestone 9 — Chat realtime
- 19A: Conversation và membership.
- 19B: Tin nhắn một-một.
- 19C: Lưu message trong PostgreSQL.
- 19D: Cursor pagination lịch sử chat.
- 19E: WebSocket message delivery.
- 19F: Trạng thái delivered/read.
- 19G: Typing indicator.
- 19H: Online presence với Redis TTL.
- 19I: Chống gửi trùng message bằng client message ID.
Milestone 10 — Frontend
Khuyến nghị dùng React + Next.js.
- 20A: Khởi tạo frontend trong apps/web.
- 20B: API client và error handling.
- 20C: Register/login/logout.
- 20D: Session bootstrap bằng /auth/me.
- 20E: Trang profile.
- 20F: Chỉnh sửa profile và upload avatar.
- 20G: Friend request UI.
- 20H: Post composer.
- 20I: Infinite-scroll feed.
- 20J: Notification realtime.
- 20K: Chat interface.
- 20L: Optimistic update.
Milestone 11 — Bảo mật và vận hành
- Email verification.
- Quên và đặt lại mật khẩu.
- Đổi mật khẩu và revoke toàn bộ session.
- Rate limiting bằng Redis.
- Giới hạn upload.
- Security headers.
- Structured logging.
- Request ID.
- Health/readiness check.
- Database integration test.
- Backup và migration strategy.
- CI/CD.
- Deploy API, PostgreSQL, Redis và object storage.