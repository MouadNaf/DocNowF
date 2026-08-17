import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/utils/colors.dart';
import '../../../../core/network/api_client.dart';
import '../../../../injection_container.dart';
import '../../data/chat_service.dart';

// ─── Message model ────────────────────────────────────────────────────────────

class _ChatMessage {
  final String text;
  final bool isBot;
  final String type; // 'text' | 'doctors' | 'appointments'
  final List<dynamic> data;

  const _ChatMessage({
    required this.text,
    required this.isBot,
    this.type = 'text',
    this.data = const [],
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

class ChatbotPage extends StatefulWidget {
  const ChatbotPage({super.key});

  @override
  State<ChatbotPage> createState() => _ChatbotPageState();
}

class _ChatbotPageState extends State<ChatbotPage> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late final ChatService _chatService;
  bool _isLoading = false;

  final List<_ChatMessage> _messages = [
    const _ChatMessage(
      text:
          'Hello! I am your DocNow assistant 👋\nHow can I help you today?\n\n'
          'I can help you:\n• Search for doctors\n• Check availability\n• Book or cancel appointments\n• View your appointments',
      isBot: true,
    ),
  ];

  static const List<String> _quickSuggestions = [
    'Find a cardiologist',
    'Who is available tomorrow?',
    'Show my appointments',
    'Cancel an appointment',
  ];

  @override
  void initState() {
    super.initState();
    _chatService = ChatService(apiClient: sl<ApiClient>());
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage(String message) async {
    final text = message.trim();
    if (text.isEmpty || _isLoading) return;

    setState(() {
      _messages.add(_ChatMessage(text: text, isBot: false));
      _isLoading = true;
    });
    _controller.clear();
    _scrollToBottom();

    // Prepare conversation history (last 10 messages, skip the welcome message)
    final history = _messages
        .where((m) => m != _messages.first) // skip welcome message
        .take(10) // taking last 10
        .map((m) {
          String fullText = m.text;
          if (m.data.isNotEmpty) {
            fullText += "\n[System Context - Data presented to user:]\n" + jsonEncode(m.data);
          }
          return {
            'role': m.isBot ? 'model' : 'user',
            'text': fullText,
          };
        })
        .toList();

    final response = await _chatService.sendMessage(text, history: history);

    setState(() {
      _isLoading = false;
      _messages.add(_ChatMessage(
        text: response.message,
        isBot: true,
        type: response.type,
        data: response.data,
      ));
    });
    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.health_and_safety, color: Colors.white),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Medical Assistant',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'Online now',
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // ── Message list ─────────────────────────────────────────
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length + (_isLoading ? 1 : 0) + 1,
              itemBuilder: (context, index) {
                // Quick suggestions at end
                if (index == _messages.length + (_isLoading ? 1 : 0)) {
                  return Column(
                    children: [
                      const SizedBox(height: 8),
                      const Center(
                        child: Text(
                          'Quick suggestions',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        alignment: WrapAlignment.center,
                        children: _quickSuggestions
                            .map((s) => GestureDetector(
                                  onTap: () => _sendMessage(s),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 14,
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: AppColors.border),
                                    ),
                                    child: Text(
                                      s,
                                      style: const TextStyle(
                                        color: AppColors.textPrimary,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ))
                            .toList(),
                      ),
                      const SizedBox(height: 16),
                    ],
                  );
                }

                // Typing indicator
                if (_isLoading && index == _messages.length) {
                  return const _TypingIndicator();
                }

                final msg = _messages[index];
                return _MessageBubble(message: msg);
              },
            ),
          ),

          // ── Input bar ────────────────────────────────────────────
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(14, 8, 14, 14),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: TextField(
                        controller: _controller,
                        enabled: !_isLoading,
                        decoration: const InputDecoration(
                          hintText: 'Write your message here...',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                        ),
                        onSubmitted: _sendMessage,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: BoxDecoration(
                      color: _isLoading
                          ? AppColors.primary.withOpacity(0.5)
                          : AppColors.primary,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      onPressed:
                          _isLoading ? null : () => _sendMessage(_controller.text),
                      icon: const Icon(Icons.send_rounded, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Message bubble ───────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  final _ChatMessage message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final align =
        message.isBot ? CrossAxisAlignment.start : CrossAxisAlignment.end;
    final bubbleColor = message.isBot ? Colors.white : AppColors.primary;
    final textColor = message.isBot ? AppColors.textPrimary : Colors.white;

    return Column(
      crossAxisAlignment: align,
      children: [
        // Text bubble
        Container(
          margin: const EdgeInsets.only(bottom: 6),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width * 0.78,
          ),
          decoration: BoxDecoration(
            color: bubbleColor,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border.withOpacity(0.6)),
          ),
          child: Text(
            message.text,
            style: TextStyle(color: textColor, fontSize: 14, height: 1.4),
          ),
        ),

        // Rich data cards
        if (message.isBot && message.type == 'doctors' && message.data.isNotEmpty)
          ..._buildDoctorCards(message.data),

        if (message.isBot &&
            message.type == 'appointments' &&
            message.data.isNotEmpty)
          ..._buildAppointmentCards(message.data),

        const SizedBox(height: 6),
      ],
    );
  }

  List<Widget> _buildDoctorCards(List<dynamic> data) {
    return data.map((item) {
      final d = ChatDoctorData.fromJson(item as Map<String, dynamic>);
      return Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        constraints: const BoxConstraints(maxWidth: 300),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border.withOpacity(0.6)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: CachedNetworkImage(
                imageUrl: d.profilePicture.isNotEmpty
                    ? d.profilePicture
                    : 'https://ui-avatars.com/api/?name=${Uri.encodeComponent(d.name)}&background=random',
                width: 48,
                height: 48,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(
                  width: 48,
                  height: 48,
                  color: Colors.grey.shade200,
                  child: const Icon(Icons.person, color: Colors.grey),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Dr. ${d.name}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    d.specialty,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                  if (d.city.isNotEmpty)
                    Row(
                      children: [
                        const Icon(Icons.location_on,
                            size: 12, color: AppColors.textSecondary),
                        const SizedBox(width: 2),
                        Text(
                          d.city,
                          style: const TextStyle(
                            color: AppColors.textSecondary,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  if (d.fee.isNotEmpty)
                    Text(
                      d.fee,
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  List<Widget> _buildAppointmentCards(List<dynamic> data) {
    return data.map((item) {
      final a = ChatAppointmentData.fromJson(item as Map<String, dynamic>);
      final statusColor = a.status == 'confirmed'
          ? Colors.green
          : a.status == 'cancelled'
              ? Colors.red
              : Colors.orange;

      return Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        constraints: const BoxConstraints(maxWidth: 300),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border.withOpacity(0.6)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Dr. ${a.doctorName}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    a.status,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              a.doctorSpecialty,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.calendar_today,
                    size: 12, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  a.date,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: 10),
                const Icon(Icons.access_time,
                    size: 12, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  a.time,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.location_on,
                    size: 12, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  a.location,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }).toList();
  }
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

class _TypingIndicator extends StatefulWidget {
  const _TypingIndicator();

  @override
  State<_TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<_TypingIndicator>
    with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;
  late final List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      3,
      (i) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 400),
      )..repeat(reverse: true, period: Duration(milliseconds: 600 + i * 150)),
    );
    _animations = _controllers
        .map((c) => Tween<double>(begin: 0, end: -6).animate(
              CurvedAnimation(parent: c, curve: Curves.easeInOut),
            ))
        .toList();

    for (var i = 0; i < 3; i++) {
      Future.delayed(Duration(milliseconds: i * 150), () {
        if (mounted) _controllers[i].repeat(reverse: true);
      });
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border.withOpacity(0.6)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            return AnimatedBuilder(
              animation: _animations[i],
              builder: (_, __) => Transform.translate(
                offset: Offset(0, _animations[i].value),
                child: Container(
                  width: 7,
                  height: 7,
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.6),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
