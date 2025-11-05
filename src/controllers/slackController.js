import { User } from "../models/userModel.js";
import { App } from "@slack/bolt";

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
});

const getSlackUserByEmail = async (email) => {
    try {
        const result = await app.client.users.lookupByEmail({
            token: process.env.SLACK_BOT_TOKEN,
            email,
        });
        return result.user;
    } catch (error) {
        console.error("Error fetching user by email:", error);
        return null;
    }
};

// Function to detect and extract image/GIF URLs from text
const extractMediaUrls = (text) => {
    const imageRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s]*)?)/gi;
    const gifRegex = /(https?:\/\/[^\s]+\.gif(\?[^\s]*)?)/gi;
    const giphyRegex = /(https?:\/\/(media\.giphy\.com|giphy\.com\/gifs)\/[^\s]+)/gi;
    const tenorRegex = /(https?:\/\/[^\s]*tenor\.com[^\s]*)/gi;

    // Extract media URLs
    const gifMatches = text.match(gifRegex) || [];
    const giphyMatches = text.match(giphyRegex) || [];
    const tenorMatches = text.match(tenorRegex) || [];
    const imageMatches = text.match(imageRegex) || [];

    // Combine all media URLs and remove duplicates
    const mediaUrls = [...new Set([...gifMatches, ...giphyMatches, ...tenorMatches, ...imageMatches])];

    // Remove only media URLs from the text, keep other links
    let cleanedText = text;
    mediaUrls.forEach(url => {
        cleanedText = cleanedText.replace(url, '').trim();
    });

    // Clean up extra spaces
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    return {
        mediaUrls,
        cleanedText
    };
};

export const sendCheerMessage = async (req, res) => {
    try {
        const { sender_id, receiver_ids, message_post } = req.body;

        // Validate input
        if (!sender_id || !receiver_ids || !Array.isArray(receiver_ids) || receiver_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "sender_id and receiver_ids (array) are required"
            });
        }

        // Get sender details
        const sender = await User.getUser(sender_id);
        if (!sender) {
            return res.status(404).json({
                success: false,
                message: "Sender not found"
            });
        }

        // Get receiver details
        const receiverPromises = receiver_ids.map(async (receiver_id) => {
            return await User.getUser(receiver_id);
        });

        const receivers = await Promise.all(receiverPromises);
        const validReceivers = receivers.filter(receiver => receiver !== null);

        if (validReceivers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No valid receivers found"
            });
        }

        // Get Slack user info for sender
        const senderSlackUser = await getSlackUserByEmail(sender.user_email);
        const senderMention = senderSlackUser ? `<@${senderSlackUser.id}>` : `${sender.first_name} ${sender.last_name}`;

        // Get Slack user info for receivers and create mentions
        const receiverMentions = [];
        for (const receiver of validReceivers) {
            const receiverSlackUser = await getSlackUserByEmail(receiver.user_email);
            if (receiverSlackUser) {
                receiverMentions.push(`<@${receiverSlackUser.id}>`);
            } else {
                receiverMentions.push(`${receiver.first_name} ${receiver.last_name}`);
            }
        }

        const receiverMentionsString = receiverMentions.join(', ');
        const checkHereLink = "https://www.suitelifer.com/app/cheer-a-peer";

        const messageBlocks = [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "💟 Cheer A Peer",
                    emoji: true
                }
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*${senderMention}* just cheered ${receiverMentionsString}!`
                }
            },
            {
                type: "divider"
            }
        ];

        if (message_post && message_post.trim()) {
            const { mediaUrls, cleanedText } = extractMediaUrls(message_post.trim());

            if (cleanedText) {
                const formattedMessage = cleanedText.replace(/\n/g, '\n>');

                messageBlocks.push(
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Message:*`
                        }
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `>${formattedMessage}`
                        }
                    }
                );
            }

            // Add media sections if there are media URLs
            if (mediaUrls.length > 0) {
                if (cleanedText) {
                    messageBlocks.push({ type: "divider" });
                }

                const firstMediaUrl = mediaUrls[0];
                messageBlocks.push(
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Media Attachment:*`
                        }
                    },
                    {
                        type: "image",
                        image_url: firstMediaUrl,
                        alt_text: "Cheer celebration media"
                    }
                );

                if (mediaUrls.length > 1) {
                    const additionalMedia = mediaUrls.slice(1);
                    const mediaLinks = additionalMedia.map((url, index) =>
                        `<${url}|media ${index + 2}>`
                    ).join(', ');

                    messageBlocks.push({
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `*Other gifs/imgs:* ${mediaLinks}`
                        }
                    });
                }

                messageBlocks.push({ type: "divider" });
            } else if (cleanedText) {
                messageBlocks.push({ type: "divider" });
            }
        }

        messageBlocks.push({
            type: "actions",
            elements: [
                {
                    type: "button",
                    text: {
                        type: "plain_text",
                        text: "Cheer your peers",
                        emoji: true,
                    },
                    url: checkHereLink,
                    action_id: "cheer-button",
                },
            ],
        });


        // Fallback text for notifications
        const fallbackText = message_post && message_post.trim()
            ? `${senderMention} cheered ${receiverMentionsString} with message: "${message_post.substring(0, 100)}${message_post.length > 100 ? '...' : ''}"`
            : `${senderMention} cheered ${receiverMentionsString}. Check here.`;

        // Send message to Slack - enable unfurling for media previews
        await app.client.chat.postMessage({
            token: process.env.SLACK_BOT_TOKEN,
            channel: process.env.SLACK_CHANNEL,
            text: fallbackText,
            blocks: messageBlocks,
            unfurl_links: true,
            unfurl_media: true
        });

        return res.status(200).json({
            success: true,
            message: "Cheer message sent successfully",
            data: {
                sender: senderMention,
                receivers: receiverMentions,
                message: message_post || null,
                mediaUrls: message_post ? extractMediaUrls(message_post).mediaUrls : [],
                slack_message: fallbackText
            }
        });

    } catch (error) {
        console.error("Error sending cheer message:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};