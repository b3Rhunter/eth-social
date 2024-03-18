import { useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';
import { IoIosSend } from "react-icons/io";

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
});

const MyGPT = () => {

    const [prompt, setPrompt] = useState('');
    const [chat, setChat] = useState([]);
    const [isThinking, setIsThinking] = useState(false);

    const chatEndRef = useRef(null);
    const textAreaRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = 'inherit';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [prompt]);

    const generate = async () => {
        if (!prompt.trim()) return;

        const newUserPrompt = { role: 'user', content: prompt };
        setChat(currentChat => [...currentChat, newUserPrompt]);
        setPrompt('');

        setIsThinking(true);

        const systemMessage = `You are a helpful assistant.`;

        try {
            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: prompt },
                ],
                model: 'gpt-4',
            });

            const newAiResponse = { role: 'assistant', content: completion.choices[0].message.content };
            setChat(currentChat => [...currentChat, newAiResponse]);
        } catch (error) {
            console.error('Failed to generate', error);
        } finally {
            setIsThinking(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            generate();
        }
    };

    const parseContent = (content) => {
        const regex = /```[\s\S]+?```/g;
        let result = [];
        let lastIndex = 0;

        content.replace(regex, (match, index) => {
            if (index > lastIndex) {
                result.push({ type: 'text', content: content.slice(lastIndex, index) });
            }
            result.push({ type: 'code', content: match.slice(3, -3) });
            lastIndex = index + match.length;
        });

        if (lastIndex < content.length) {
            result.push({ type: 'text', content: content.slice(lastIndex) });
        }

        return result;
    };

    return (
        <div className="my-gpt">
            <div className="chat-history">
                {chat.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        {parseContent(message.content).map((segment, idx) =>
                            segment.type === 'code' ? (
                                <pre key={idx}><code>{segment.content}</code></pre>
                            ) : (
                                <p key={idx}>{segment.content}</p>
                            )
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
                {isThinking && (
                    <div className="message thinking">
                        thinking
                        <span className="ellipsis">
                            <span>.</span><span>.</span><span>.</span>
                        </span>
                    </div>
                )}

            </div>

            <div className="chat-input">
                <textarea
                    ref={textAreaRef}
                    className="chat-bar"
                    placeholder="Type your message here..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button className="send-btn" onClick={generate}><IoIosSend /></button>
            </div>
        </div>
    );
}

export default MyGPT;