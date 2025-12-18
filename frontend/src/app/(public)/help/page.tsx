"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, Users, MessageSquare, Settings, Shield, Rocket, Mail } from "lucide-react";

export default function HelpPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        {
            icon: Rocket,
            title: "Getting Started",
            description: "Learn the basics of using Timber",
            color: "text-blue-500",
            faqs: [
                {
                    question: "How do I create an account?",
                    answer: "Click the 'Sign Up' button in the top right corner, fill in your details including username, email, and password, then verify your email address."
                },
                {
                    question: "How do I set up my profile?",
                    answer: "Go to your profile page by clicking your avatar, then click 'Edit Profile'. You can upload a profile picture, add a bio, and customize your information."
                },
                {
                    question: "How do I join communities?",
                    answer: "Browse communities on the Communities page, click on a community you're interested in, and click the 'Join' button."
                }
            ]
        },
        {
            icon: Users,
            title: "Communities",
            description: "Everything about creating and managing communities",
            color: "text-green-500",
            faqs: [
                {
                    question: "How do I create a community?",
                    answer: "Click the '+' button in the Communities sidebar or on the Communities page. Fill in the community name, description, and optionally upload an avatar. You can also choose to make it private."
                },
                {
                    question: "What are community guidelines?",
                    answer: "Community guidelines are rules set by community admins to maintain a healthy and respectful environment. Always read and follow the guidelines of communities you join."
                },
                {
                    question: "How do I manage my community?",
                    answer: "As a community admin, click the three-dot menu on your community and select 'Edit Community' to update details, or manage members through the members panel."
                },
                {
                    question: "What are moderator tools?",
                    answer: "Moderators can edit community details, manage members, and ensure community guidelines are followed. Access these tools through the community settings menu."
                }
            ]
        },
        {
            icon: MessageSquare,
            title: "Posts & Comments",
            description: "Creating and interacting with content",
            color: "text-purple-500",
            faqs: [
                {
                    question: "How do I create a post?",
                    answer: "Navigate to a community and click the 'Create Post' button. Add your title, content, and optionally attach images or media."
                },
                {
                    question: "Can I edit or delete my posts?",
                    answer: "Yes! Click the three-dot menu on your post and select 'Edit' to modify it or 'Delete' to remove it permanently."
                },
                {
                    question: "How do comments work?",
                    answer: "Click on any post to view and add comments. You can reply to other comments, upvote/downvote, and engage in discussions."
                },
                {
                    question: "Does Timber support markdown?",
                    answer: "Yes! You can use markdown formatting in posts and comments to add bold text, italics, links, code blocks, and more."
                }
            ]
        },
        {
            icon: BookOpen,
            title: "Chat & Messaging",
            description: "Real-time communication features",
            color: "text-orange-500",
            faqs: [
                {
                    question: "How does real-time chat work?",
                    answer: "Join a community and navigate to the Chat section. Messages appear instantly for all members in the community chat room."
                },
                {
                    question: "Can I edit or unsend messages?",
                    answer: "Yes! Hover over your message and click the three-dot menu. You can edit your message or unsend it completely."
                },
                {
                    question: "What are read receipts?",
                    answer: "Read receipts show you when other members have seen your messages. You'll see small avatars below your messages indicating who has read them."
                },
                {
                    question: "Are community chats private?",
                    answer: "Community chats are visible to all members of that community. Private communities have chats only visible to members."
                }
            ]
        },
        {
            icon: Settings,
            title: "Account & Settings",
            description: "Manage your account preferences",
            color: "text-red-500",
            faqs: [
                {
                    question: "How do I change my profile settings?",
                    answer: "Click your avatar in the top right, go to your profile, and click 'Edit Profile' to update your information, avatar, and bio."
                },
                {
                    question: "How do I change my password?",
                    answer: "Go to your account settings and look for the 'Change Password' option. You'll need to enter your current password and choose a new one."
                },
                {
                    question: "Can I customize notifications?",
                    answer: "Yes! In your settings, you can control which notifications you receive for posts, comments, messages, and community updates."
                },
                {
                    question: "How do I delete my account?",
                    answer: "Contact support or look for the 'Delete Account' option in your account settings. Note that this action is permanent and cannot be undone."
                }
            ]
        },
        {
            icon: Shield,
            title: "Safety & Privacy",
            description: "Stay safe and protect your privacy",
            color: "text-teal-500",
            faqs: [
                {
                    question: "How do I report inappropriate content?",
                    answer: "Click the three-dot menu on any post, comment, or message and select 'Report'. Choose the reason for reporting and submit."
                },
                {
                    question: "How do I block a user?",
                    answer: "Go to the user's profile and click 'Block User'. You won't see their content and they won't be able to interact with you."
                },
                {
                    question: "What privacy controls are available?",
                    answer: "You can control who sees your profile, posts, and activity. Adjust these settings in your account privacy preferences."
                },
                {
                    question: "How does Timber ensure community safety?",
                    answer: "Timber uses a combination of community moderation, reporting tools, and automated systems to maintain a safe environment for all users."
                }
            ]
        }
    ];

    const filteredCategories = categories.map(category => ({
        ...category,
        faqs: category.faqs.filter(faq =>
            searchQuery === "" ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.faqs.length > 0);

    return (
        <div className="min-h-screen bg-background">
            {/* Header with Gradient */}
            <div className="relative border-b bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
                <div className="relative max-w-6xl mx-auto px-6 py-16">
                    <div className="text-center mb-8">
                        <Badge variant="secondary" className="mb-4">
                            Help Center
                        </Badge>
                        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            How can we help you?
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Find answers to common questions and learn how to make the most of Timber
                        </p>
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search for help articles..."
                            className="pl-12 h-14 text-base shadow-lg border-2 focus-visible:ring-2 focus-visible:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {searchQuery === "" ? (
                    <>
                        {/* Enhanced Category Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            {categories.map((category, index) => {
                                const Icon = category.icon;
                                return (
                                    <Card
                                        key={index}
                                        className="group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/50"
                                    >
                                        <CardHeader className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                                                    <Icon className="h-7 w-7" />
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    {category.faqs.length}
                                                </Badge>
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                                                    {category.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm leading-relaxed">
                                                    {category.description}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* All FAQs */}
                        <div className="space-y-12">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
                                <p className="text-muted-foreground">Browse through our most common questions and answers</p>
                            </div>

                            {categories.map((category, catIndex) => {
                                const Icon = category.icon;
                                return (
                                    <div key={catIndex} className="space-y-4">
                                        <div className="flex items-center gap-3 pb-2 border-b">
                                            <div className={`p-2.5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ${category.color}`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-semibold">{category.title}</h3>
                                                <p className="text-sm text-muted-foreground">{category.faqs.length} articles</p>
                                            </div>
                                        </div>

                                        <Accordion type="single" collapsible className="w-full">
                                            {category.faqs.map((faq, faqIndex) => (
                                                <AccordionItem key={faqIndex} value={`${catIndex}-${faqIndex}`} className="border-l-2 border-transparent hover:border-primary/50 transition-colors pl-4">
                                                    <AccordionTrigger className="text-left hover:text-primary transition-colors font-medium">
                                                        {faq.question}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                                        {faq.answer}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    /* Search Results */
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">
                            {filteredCategories.length > 0
                                ? `Search Results (${filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0)} results)`
                                : "No results found"}
                        </h2>

                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((category, catIndex) => {
                                const Icon = category.icon;
                                return (
                                    <div key={catIndex} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg bg-primary/10 ${category.color}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-xl font-semibold">{category.title}</h3>
                                        </div>

                                        <Accordion type="single" collapsible className="w-full">
                                            {category.faqs.map((faq, faqIndex) => (
                                                <AccordionItem key={faqIndex} value={`${catIndex}-${faqIndex}`}>
                                                    <AccordionTrigger className="text-left">
                                                        {faq.question}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="text-muted-foreground">
                                                        {faq.answer}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">
                                    No results found for "{searchQuery}". Try different keywords.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Enhanced Contact Support */}
                <div className="mt-20 p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl text-center border-2 border-primary/10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Can't find what you're looking for? Our support team is here to help you.
                    </p>
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-card rounded-lg border shadow-sm">
                        <Mail className="h-4 w-4 text-primary" />
                        <span className="font-medium">support@timber.com</span>
                    </div>
                </div>
            </div>
        </div>
    );
}