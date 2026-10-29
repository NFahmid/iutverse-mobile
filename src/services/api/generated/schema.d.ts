/**
 * GENERATED FILE. DO NOT EDIT.
 * Contract: iutverse-api 1.0.0 (provisional pin)
 * Source:   A-Piyas-04/IUTverse (unreleased build)
 * sha256:   08c72600c31d2e0f4b1554f05cd784fc17a9ae51d6316132630c8f84aa3a4d04
 * Generator: openapi-typescript 7.13.0
 * Regenerate with `npm run contract:generate`.
 */
export interface paths {
    "/api/academic/departments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get All Departments */
        get: operations["academic_getAllDepartments"];
        put?: never;
        /** Create Department */
        post: operations["academic_createDepartment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/academic/resources": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get All Academic Resources */
        get: operations["academic_getAllAcademicResources"];
        put?: never;
        /** Create Academic Resource */
        post: operations["academic_createAcademicResource"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/academic/resources/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Academic Resource By Id */
        get: operations["academic_getAcademicResourceById"];
        /** Update Academic Resource */
        put: operations["academic_updateAcademicResource"];
        post?: never;
        /** Delete Academic Resource */
        delete: operations["academic_deleteAcademicResource"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/academic/resources/{id}/file": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Resource File */
        get: operations["academic_resourceFile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/academic/resources/{id}/helpful": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Toggle Helpful */
        post: operations["academic_toggleHelpful"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/admin/users/{userId}/role": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update User Role */
        patch: operations["admin_updateUserRole"];
        trace?: never;
    };
    "/api/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login */
        post: operations["auth_login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Current member (membership gate)
         * @description Call after sign-in. Succeeds only for an active IUTverse member; a valid Supabase session for a non-member gets 403.
         */
        get: operations["auth_getMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Change Password */
        put: operations["auth_changePassword"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/password/reset-request": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Request Password Reset */
        post: operations["auth_requestPasswordReset"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/signup": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Signup */
        post: operations["auth_signup"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get All Users */
        get: operations["auth_getAllUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/auth/validate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Validate the access token */
        get: operations["auth_validateToken"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/campus/weather": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Weather */
        get: operations["campus_weather"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cat-posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get All Posts */
        get: operations["catPosts_getAllPosts"];
        put?: never;
        /** Create Post */
        post: operations["catPosts_createPost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cat-posts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Post By Id */
        get: operations["catPosts_getPostById"];
        put?: never;
        post?: never;
        /** Delete Post */
        delete: operations["catPosts_deletePost"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cat-posts/{id}/comment": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add Comment */
        post: operations["catPosts_addComment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cat-posts/{id}/like": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Toggle Like */
        post: operations["catPosts_toggleLike"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cat-qa/answers/{answerId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete Answer */
        delete: operations["catQa_deleteAnswer"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cat-qa/questions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get All Questions */
        get: operations["catQa_getAllQuestions"];
        put?: never;
        /** Create Question */
        post: operations["catQa_createQuestion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cat-qa/questions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Question By Id */
        get: operations["catQa_getQuestionById"];
        put?: never;
        post?: never;
        /** Delete Question */
        delete: operations["catQa_deleteQuestion"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cat-qa/questions/{id}/answers": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add Answer */
        post: operations["catQa_addAnswer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/attachments/{messageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Attachment */
        get: operations["chat_getAttachment"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/blocks/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Block User */
        post: operations["chat_blockUser"];
        /** Unblock User */
        delete: operations["chat_unblockUser"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/conversations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Conversations */
        get: operations["chat_getConversations"];
        put?: never;
        /** Start Conversation */
        post: operations["chat_startConversation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/conversations/{conversationId}/clear": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Clear Conversation */
        post: operations["chat_clearConversation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/conversations/{conversationId}/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Conversation Media */
        get: operations["chat_conversationMedia"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/conversations/{conversationId}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Messages */
        get: operations["chat_getMessages"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/conversations/{conversationId}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Mark As Read */
        put: operations["chat_markAsRead"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/conversations/{conversationId}/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search Conversation */
        get: operations["chat_searchConversation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/conversations/{conversationId}/settings": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Update Conversation Settings */
        patch: operations["chat_updateConversationSettings"];
        trace?: never;
    };
    "/api/chat/delivered": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Mark Delivered */
        post: operations["chat_markDelivered"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/gifs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Gifs */
        get: operations["chat_gifs"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Send Message */
        post: operations["chat_sendMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/messages/{messageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Edit Message */
        patch: operations["chat_editMessage"];
        trace?: never;
    };
    "/api/chat/messages/{messageId}/reactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** React To Message */
        post: operations["chat_reactToMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/chat/share": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Share Post */
        post: operations["chat_sharePost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/comments/{commentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Edit own comment */
        put: operations["comments_updateComment"];
        post?: never;
        /** Delete own comment */
        delete: operations["comments_deleteComment"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/comments/{commentId}/replies": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List replies to a comment */
        get: operations["comments_getCommentReplies"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/confessions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get All Confessions */
        get: operations["confessions_getAllConfessions"];
        put?: never;
        /** Create Confession */
        post: operations["confessions_createConfession"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/confessions/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Confession By Id */
        get: operations["confessions_getConfessionById"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/confessions/{id}/polls/{pollId}/vote": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Vote On Poll */
        post: operations["confessions_voteOnPoll"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/confessions/{id}/reactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add Reaction */
        post: operations["confessions_addReaction"];
        /** Remove Reaction */
        delete: operations["confessions_removeReaction"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/confessions/{id}/user-reactions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get User Reactions */
        get: operations["confessions_getUserReactions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/confessions/analytics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Analytics */
        get: operations["confessions_getAnalytics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/confessions/polls/{pollId}/user-voted": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Check User Voted */
        get: operations["confessions_checkUserVoted"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/confessions/random": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Random Confession */
        get: operations["confessions_getRandomConfession"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/dashboard": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** GET /api/dashboard */
        get: operations["dashboard_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/events": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List Events */
        get: operations["events_listEvents"];
        put?: never;
        /** Create Event */
        post: operations["events_createEvent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/events/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update Event */
        put: operations["events_updateEvent"];
        post?: never;
        /** Delete Event */
        delete: operations["events_deleteEvent"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/events/{id}/rsvp": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Update Rsvp */
        put: operations["events_updateRsvp"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/feed": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Feed (same department and batch; falls back to all posts) */
        get: operations["feed_getUserFeed"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Liveness check */
        get: operations["health_get"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/issue-reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Issue Report */
        post: operations["issueReports_createIssueReport"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get All Jobs */
        get: operations["jobs_getAllJobs"];
        put?: never;
        /** Create Job */
        post: operations["jobs_createJob"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Job By Id */
        get: operations["jobs_getJobById"];
        /** Update Job */
        put: operations["jobs_updateJob"];
        post?: never;
        /** Delete Job */
        delete: operations["jobs_deleteJob"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs/{id}/application-status": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get User Application Status */
        get: operations["jobs_getUserApplicationStatus"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs/{id}/applications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Job Applications */
        get: operations["jobs_getJobApplications"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs/{id}/applications/count": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Application Count */
        get: operations["jobs_getApplicationCount"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs/{id}/apply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Apply To Job */
        post: operations["jobs_applyToJob"];
        /** Remove Application */
        delete: operations["jobs_removeApplication"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs/{id}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Comments By Job Id */
        get: operations["jobs_getCommentsByJobId"];
        put?: never;
        /** Create Comment */
        post: operations["jobs_createComment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs/{id}/comments/{commentId}/reply": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create Reply */
        post: operations["jobs_createReply"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/jobs/comments/{commentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Comment By Id */
        get: operations["jobs_getCommentById"];
        /** Update Comment */
        put: operations["jobs_updateComment"];
        post?: never;
        /** Delete Comment */
        delete: operations["jobs_deleteComment"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/lost-and-found": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get All Posts */
        get: operations["lostAndFound_getAllPosts"];
        put?: never;
        /** Create Post */
        post: operations["lostAndFound_createPost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/lost-and-found/{postId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Post By Id */
        get: operations["lostAndFound_getPostById"];
        put?: never;
        post?: never;
        /** Delete Post */
        delete: operations["lostAndFound_deletePost"];
        options?: never;
        head?: never;
        /** Update Post */
        patch: operations["lostAndFound_updatePost"];
        trace?: never;
    };
    "/api/lost-and-found/{postId}/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Mark As Active */
        patch: operations["lostAndFound_markAsActive"];
        trace?: never;
    };
    "/api/lost-and-found/{postId}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Mark As Resolved */
        patch: operations["lostAndFound_markAsResolved"];
        trace?: never;
    };
    "/api/moderation/posts/{postId}/identity-disclosures": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Disclose Post Identity */
        post: operations["moderation_disclosePostIdentity"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List posts */
        get: operations["posts_getPosts"];
        put?: never;
        /** Create a post */
        post: operations["posts_createPost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get a post */
        get: operations["posts_getPost"];
        /** Update own post */
        put: operations["posts_updatePost"];
        post?: never;
        /** Delete own post */
        delete: operations["posts_deletePost"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts/{id}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List top-level comments of a post */
        get: operations["posts_getPostComments"];
        put?: never;
        /** Comment on a post */
        post: operations["posts_createComment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/posts/{id}/react": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Toggle or change a reaction */
        post: operations["posts_reactToPost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Own profile (private fields included) */
        get: operations["profile_getOwnProfile"];
        /** Update Profile */
        put: operations["profile_updateProfile"];
        /** Create Profile */
        post: operations["profile_createProfile"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile-reference-data": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Departments, programs, halls and rooms */
        get: operations["profileReferenceData_getProfileReferenceData"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Member profile */
        get: operations["profile_getProfile"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/cover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete cover picture */
        delete: operations["profile_deleteCoverPicture"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/cover/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Cover Picture */
        get: operations["profile_getCoverPicture"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Own profile (alias of GET /api/profile) */
        get: operations["profile_getOwnProfileMe"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Patch Own Profile */
        patch: operations["profile_patchOwnProfile"];
        trace?: never;
    };
    "/api/profile/picture": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete profile picture */
        delete: operations["profile_deleteProfilePicture"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/picture/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Profile Picture */
        get: operations["profile_getProfilePicture"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/upload-cover": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload cover picture */
        post: operations["profile_uploadCoverPicture"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/profile/upload-picture": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Upload profile picture */
        post: operations["profile_uploadProfilePicture"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Reports List */
        get: operations["reports_reportsList"];
        put?: never;
        /** Report Create */
        post: operations["reports_reportCreate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reports/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Report Update */
        patch: operations["reports_reportUpdate"];
        trace?: never;
    };
    "/api/saved-items/{kind}/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Saved Status */
        get: operations["savedItems_savedStatus"];
        put?: never;
        /** Saved Create */
        post: operations["savedItems_savedCreate"];
        /** Saved Delete */
        delete: operations["savedItems_savedDelete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search */
        get: operations["search_search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/uploads": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Prepare a direct upload to Storage */
        post: operations["uploads_createUploadIntent"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Change display name */
        put: operations["user_updateUserName"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Public member by id */
        get: operations["user_getUserById"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/by-student-id/{studentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get User By Student Id */
        get: operations["user_getUserByStudentId"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/student-id": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get Student Id */
        get: operations["user_getStudentId"];
        /** Update Student Id */
        put: operations["user_updateStudentId"];
        post?: never;
        /** Delete Student Id */
        delete: operations["user_deleteStudentId"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/user/student-id/check/{studentId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Check Student Id Availability */
        get: operations["user_checkStudentIdAvailability"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/users/search": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Search members by name (min 2 characters, max 20 results) */
        get: operations["users_searchUsers"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description Page metadata. `page`, `limit` and `totalPages` are always present. The total count key differs by endpoint: `total` (most), `totalPosts` (posts, feed), `totalComments` (post comments). Clients must read whichever is present. */
        PaginationMeta: {
            page: number;
            limit: number;
            totalPages?: number;
            total?: number;
            totalPosts?: number;
            totalComments?: number;
        } & {
            [key: string]: unknown;
        };
        /** @description Standard success envelope. `data` is present on most responses; its shape is operation-specific. */
        SuccessEnvelope: {
            /** @enum {boolean} */
            success: true;
            message?: string;
            data?: unknown;
            pagination?: components["schemas"]["PaginationMeta"];
        } & {
            [key: string]: unknown;
        };
        /** @description Error body. `message` is always present. `success: false` is present on most errors but not all (some controllers answer `{ message }` only). `code` is a stable machine-readable value and is currently emitted by the authentication step only; clients must not require it elsewhere. */
        ErrorBody: {
            /** @enum {boolean} */
            success?: false;
            message: string;
            /**
             * @description Stable error code. Unknown values must be treated as a generic error of that HTTP status.
             * @enum {string}
             */
            code?: "AUTH_TOKEN_REQUIRED" | "AUTH_TOKEN_INVALID" | "MEMBERSHIP_REQUIRED";
            /** @description Internal detail. Only sent when the server runs with EXPOSE_ERRORS outside production. */
            error?: string;
        } & {
            [key: string]: unknown;
        };
        /** @description A JSON object whose fields are not yet documented (contract status `inferred`). */
        GenericObject: {
            [key: string]: unknown;
        };
        /** @description Identity of the authenticated, active member. */
        Me: {
            /** Format: uuid */
            id: string;
            email: string;
            displayName?: string | null;
            /** @enum {string} */
            role: "user" | "mod" | "admin";
            /** @description Always `active` on a successful call. */
            membershipStatus: string;
        };
        MeEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["Me"];
        };
        /** @description Bare body (no `success`, no `data`). */
        ValidateTokenResponse: {
            message: string;
            user: {
                /** Format: uuid */
                id: string;
                email?: string;
                name?: string | null;
                role?: string;
            };
        };
        CommentUpdateRequest: {
            content: string;
        };
        /** @description Minimal public member card embedded in posts, comments and reactions. Null for anonymous content or when the profile is missing. */
        MemberSummary: {
            /** Format: uuid */
            id: string;
            name?: string | null;
            displayName?: string | null;
            handle?: string | null;
            batch?: number | null;
            department?: string | null;
            /** @description Public URL, absolute when Storage is configured. */
            profilePictureUrl?: string | null;
            profile?: {
                /** @description Storage object path. */
                profilePicture?: string | null;
            };
        } | null;
        Comment: {
            id: number;
            postId: number;
            /**
             * Format: uuid
             * @description Null for anonymous comments.
             */
            userId?: string | null;
            /**
             * Format: uuid
             * @description Null for anonymous comments.
             */
            authorId?: string | null;
            isAnonymous: boolean;
            content: string;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt?: string;
            parentCommentId?: number | null;
            user?: components["schemas"]["MemberSummary"];
            replies?: components["schemas"]["Comment"][];
            _count?: {
                replies?: number;
            };
        };
        CommentEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["Comment"];
        };
        MessageEnvelope: {
            /** @enum {boolean} */
            success: true;
            message: string;
        } & {
            [key: string]: unknown;
        };
        CommentListEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["Comment"][];
            pagination?: components["schemas"]["PaginationMeta"];
        };
        /** @description Count per reaction type. All seven keys are always present. */
        ReactionSummary: {
            like: number;
            funny: number;
            relatable: number;
            angry: number;
            insightful: number;
            helpful: number;
            wholesome: number;
        };
        PostReaction: {
            id: number;
            postId: number;
            /** Format: uuid */
            userId: string;
            /** @description One of the ReactionType values. */
            reactionType: string;
            user?: components["schemas"]["MemberSummary"];
        };
        Post: {
            id: number;
            /**
             * Format: uuid
             * @description Null for anonymous posts.
             */
            userId?: string | null;
            /**
             * Format: uuid
             * @description Null for anonymous posts.
             */
            authorId?: string | null;
            content: string;
            category?: string | null;
            isAnonymous: boolean;
            /** Format: date-time */
            createdAt: string;
            /** Format: date-time */
            updatedAt?: string;
            /** @description Storage object path. */
            image?: string | null;
            imageUrl?: string | null;
            likesCount?: number | null;
            reactionCount?: number;
            reactionSummary: components["schemas"]["ReactionSummary"];
            /** @description The caller's reaction, if any. One of the ReactionType values. */
            currentReaction?: string | null;
            commentCount?: number | null;
            user?: components["schemas"]["MemberSummary"];
            tags?: {
                tag?: {
                    id?: number;
                    name?: string;
                } | null;
            }[];
            reactions: components["schemas"]["PostReaction"][];
            /** @description The latest top-level comments (3 in lists, up to 100 on the detail endpoint). */
            comments: components["schemas"]["Comment"][];
            _count?: {
                comments?: number | null;
                reactions?: number | null;
            };
        };
        PostListEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["Post"][];
            pagination: components["schemas"]["PaginationMeta"];
        };
        HealthStatus: {
            /** @enum {string} */
            status: "ok";
        };
        /** @description JSON or multipart. At least one of `content` or an image is required on create. */
        PostWriteRequest: {
            content?: string;
            category?: string;
            isAnonymous?: boolean;
            /** @description Object path from POST /api/uploads (purpose `post`), instead of sending the file. */
            uploadPath?: string;
        };
        PostEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["Post"];
        };
        CommentCreateRequest: {
            content: string;
            parentCommentId?: number;
            isAnonymous?: boolean;
        };
        /** @enum {string} */
        ReactionType: "like" | "funny" | "relatable" | "angry" | "insightful" | "helpful" | "wholesome";
        PostReactRequest: {
            reactionType: components["schemas"]["ReactionType"];
        };
        PostReactResponse: {
            /** @enum {boolean} */
            success: true;
            message: string;
            /** @enum {string} */
            action: "added" | "updated" | "removed";
            reactionCount: number;
        };
        PublicUserProfile: {
            bio?: string | null;
            /** @description Storage object path. */
            profilePicture?: string | null;
            /** @description Storage object path. */
            coverPicture?: string | null;
            interests?: string[];
            badges?: string[];
        };
        /** @description A member as other members see them. Email, role and student ID are never included. */
        PublicUser: {
            /** Format: uuid */
            id: string;
            name?: string | null;
            displayName?: string | null;
            handle?: string | null;
            department?: string | null;
            departmentId?: number | null;
            batch?: number | null;
            /** Format: date-time */
            createdAt?: string;
            profilePictureUrl?: string | null;
            coverPictureUrl?: string | null;
            profile?: components["schemas"]["PublicUserProfile"];
        };
        /** @description The signed-in member's own profile: the public fields plus private ones. */
        OwnerUser: components["schemas"]["PublicUser"] & {
            studentId?: string | null;
            privacy?: {
                [key: string]: unknown;
            };
            profile?: {
                collegeName?: string | null;
                schoolName?: string | null;
                hometown?: string | null;
                currentProgram?: string | null;
                programId?: number | null;
                currentYear?: string | null;
                currentSemester?: string | null;
                currentHall?: string | null;
                hallId?: number | null;
                currentResidence?: string | null;
                /** @enum {string|null} */
                residencyType?: "resident" | "non_resident" | null;
                /** @enum {string|null} */
                residentGender?: "male" | "female" | null;
                currentRoom?: string | null;
                roomId?: number | null;
                currentBed?: string | null;
            };
        };
        OwnerUserEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["OwnerUser"];
        };
        /** @description Partial update. Unknown keys are ignored. `departmentId`, `programId`, `hallId` and `roomId` are checked against reference data; see GET /api/profile-reference-data. */
        ProfileUpdateRequest: {
            bio?: string;
            interests?: string[];
            name?: string;
            displayName?: string;
            handle?: string;
            departmentId?: number | null;
            batch?: number;
            profilePicture?: string;
            coverPicture?: string;
            studentId?: string;
            privacy?: {
                [key: string]: unknown;
            };
            collegeName?: string;
            schoolName?: string;
            hometown?: string;
            programId?: number | null;
            currentYear?: string;
            currentSemester?: string;
            hallId?: number | null;
            roomId?: number | null;
            /** @enum {string} */
            residencyType?: "resident" | "non_resident";
            /** @enum {string} */
            residentGender?: "male" | "female";
            nonResidentAddress?: string;
            currentBed?: string;
        } & {
            [key: string]: unknown;
        };
        ProfileReferenceData: {
            departments: {
                id: number;
                name: string;
            }[];
            programs: {
                id: number;
                departmentId: number;
                code: string;
                name: string;
            }[];
            halls: {
                id: number;
                name: string;
            }[];
            rooms: {
                id: number;
                hallId: number;
                roomNumber: string;
            }[];
        };
        ProfileReferenceDataEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["ProfileReferenceData"];
        };
        /** @description Bare body `{ message }` used by several profile routes. */
        BareMessage: {
            message: string;
        };
        /** @description Bare body returned after a profile or cover picture upload. */
        PictureUploadResponse: {
            message: string;
            /** @description Storage object path (profile picture only). */
            profilePicture?: string;
            profilePictureUrl?: string | null;
            coverPicture?: string;
            coverPictureUrl?: string | null;
            profile?: {
                [key: string]: unknown;
            };
        } & {
            [key: string]: unknown;
        };
        UploadIntentRequest: {
            /** @enum {string} */
            purpose: "avatar" | "cover" | "post" | "lostFound" | "catPost" | "event" | "resource" | "chat";
            /** @description Must be allowed for the purpose (images, PDF for `resource`/`chat`, video/audio for `chat`). */
            mimeType: string;
            /** @description Bytes. Limits: avatar 2 MB, cover/post/lostFound/catPost/event 5 MB, resource 10 MB, chat 10 MB (video 50 MB). */
            size: number;
            /** @description Required when purpose is `chat`. */
            conversationId?: number;
        };
        UploadIntent: {
            purpose: string;
            bucket: string;
            /** @description Pass this back as `uploadPath` to the route that uses the file. */
            path: string;
            /** @description Supabase Storage signed-upload token. Short lived; do not log. */
            token: string;
            signedUrl: string;
            mimeType: string;
            maxBytes: number;
        };
        UploadIntentEnvelope: {
            /** @enum {boolean} */
            success: true;
            message?: string;
            data: components["schemas"]["UploadIntent"];
        };
        UpdateUserNameRequest: {
            name: string;
        };
        /** @description Bare body (no `success`). */
        UpdateUserNameResponse: {
            message: string;
            user: {
                /** Format: uuid */
                id?: string;
                email?: string | null;
                name?: string | null;
                department?: string | null;
                batch?: number | null;
                studentId?: string | null;
                /** Format: date-time */
                updatedAt?: string;
            };
        };
        PublicUserEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["PublicUser"];
        };
        PublicUserListEnvelope: {
            /** @enum {boolean} */
            success: true;
            data: components["schemas"]["PublicUser"][];
        };
    };
    responses: {
        /** @description Rate limit exceeded (fixed window, per client address; see the RateLimit headers). */
        E429: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                /** @description Seconds until the window resets. */
                "Retry-After"?: number;
                "RateLimit-Limit"?: number;
                "RateLimit-Remaining"?: number;
                "RateLimit-Reset"?: number;
                "RateLimit-Policy"?: string;
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
        /** @description Unexpected server error. The body never contains internal detail in production. */
        E500: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
        /** @description Malformed or invalid request (validation failure, bad identifier, missing field). */
        E400: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
        /** @description No bearer token was sent (`code` AUTH_TOKEN_REQUIRED) or the endpoint rejected anonymous callers. */
        E401: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
        /** @description The token is invalid or expired (`code` AUTH_TOKEN_INVALID), the account is not an active member (`code` MEMBERSHIP_REQUIRED), or the caller lacks the role or ownership the operation needs. Note that an expired access token is reported as 403, not 401. */
        E403: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
        /** @description The resource does not exist, or the caller is not allowed to know it exists. */
        E404: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
        /** @description An upstream service (for example the weather provider) failed. */
        E502: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
        /** @description The feature is not configured or temporarily unavailable. */
        E503: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
        /** @description Conflict with current state (for example a duplicate). */
        E409: {
            headers: {
                "X-Request-Id": components["headers"]["XRequestId"];
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["ErrorBody"];
            };
        };
    };
    parameters: {
        /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
        Page: number;
        /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
        Limit: number;
    };
    requestBodies: never;
    headers: {
        /** @description Correlation id for the request. The server echoes a client-supplied `X-Request-Id` when it is well formed, otherwise it generates one. Quote it in bug reports. */
        XRequestId: string;
    };
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    academic_getAllDepartments: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    academic_createDepartment: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    name?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    academic_getAllAcademicResources: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
                departmentId?: unknown;
                type?: unknown;
                courseCode?: unknown;
                search?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    academic_createAcademicResource: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    title?: unknown;
                    type?: unknown;
                    departmentId?: unknown;
                    externalLink?: unknown;
                    courseCode?: unknown;
                    description?: unknown;
                    tags?: unknown;
                    /** @description Object path from POST /api/uploads (purpose resource); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    title?: unknown;
                    type?: unknown;
                    departmentId?: unknown;
                    externalLink?: unknown;
                    courseCode?: unknown;
                    description?: unknown;
                    tags?: unknown;
                    /** @description Object path from POST /api/uploads (purpose resource); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    pdf?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    academic_getAcademicResourceById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    academic_updateAcademicResource: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    title?: unknown;
                    type?: unknown;
                    departmentId?: unknown;
                    externalLink?: unknown;
                    courseCode?: unknown;
                    description?: unknown;
                    tags?: unknown;
                    /** @description Object path from POST /api/uploads (purpose resource); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    title?: unknown;
                    type?: unknown;
                    departmentId?: unknown;
                    externalLink?: unknown;
                    courseCode?: unknown;
                    description?: unknown;
                    tags?: unknown;
                    /** @description Object path from POST /api/uploads (purpose resource); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    pdf?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    academic_deleteAcademicResource: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    academic_resourceFile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirect to a signed or public file URL */
            302: {
                headers: {
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    academic_toggleHelpful: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    admin_updateUserRole: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    role?: unknown;
                    reason?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    auth_login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    email?: unknown;
                    password?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    auth_getMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MeEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    auth_changePassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    password?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    auth_requestPasswordReset: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    email?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    auth_signup: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    email?: unknown;
                    password?: unknown;
                    name?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    auth_getAllUsers: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    auth_validateToken: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ValidateTokenResponse"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    campus_weather: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
            502: components["responses"]["E502"];
            503: components["responses"]["E503"];
        };
    };
    catPosts_getAllPosts: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
                category?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catPosts_createPost: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    caption?: unknown;
                    category?: unknown;
                    location?: unknown;
                    /** @description Object path from POST /api/uploads (purpose catPost); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    caption?: unknown;
                    category?: unknown;
                    location?: unknown;
                    /** @description Object path from POST /api/uploads (purpose catPost); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    image?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catPosts_getPostById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catPosts_deletePost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catPosts_addComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    content?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catPosts_toggleLike: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catQa_deleteAnswer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                answerId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catQa_getAllQuestions: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catQa_createQuestion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    question?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catQa_getQuestionById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catQa_deleteQuestion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    catQa_addAnswer: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    answer?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_getAttachment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                messageId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirect to a signed or public file URL */
            302: {
                headers: {
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_blockUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_unblockUser: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_getConversations: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_startConversation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    otherUserId?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_clearConversation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_conversationMedia: {
        parameters: {
            query?: {
                type?: unknown;
            };
            header?: never;
            path: {
                conversationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_getMessages: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_markAsRead: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_searchConversation: {
        parameters: {
            query?: {
                q?: unknown;
            };
            header?: never;
            path: {
                conversationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_updateConversationSettings: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                conversationId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    mute?: unknown;
                    markedUnread?: unknown;
                    nickname?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_markDelivered: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_gifs: {
        parameters: {
            query?: {
                q?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_sendMessage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    sharedPostId?: unknown;
                    attachmentWidth?: unknown;
                    attachmentHeight?: unknown;
                    attachmentDurationMs?: unknown;
                    attachmentWaveform?: unknown;
                    conversationId?: unknown;
                    content?: unknown;
                    /** @description Object path from POST /api/uploads (purpose chat); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    sharedPostId?: unknown;
                    attachmentWidth?: unknown;
                    attachmentHeight?: unknown;
                    attachmentDurationMs?: unknown;
                    attachmentWaveform?: unknown;
                    conversationId?: unknown;
                    content?: unknown;
                    /** @description Object path from POST /api/uploads (purpose chat); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    image?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_editMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                messageId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    content?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_reactToMessage: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                messageId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    emoji?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    chat_sharePost: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    postId?: unknown;
                    message?: unknown;
                    userIds?: unknown;
                    conversationIds?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    comments_updateComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                commentId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommentUpdateRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommentEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    comments_deleteComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                commentId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    comments_getCommentReplies: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                commentId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommentListEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_getAllConfessions: {
        parameters: {
            query?: {
                sortBy?: unknown;
                tag?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_createConfession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    tags?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_getConfessionById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_voteOnPoll: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                pollId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    optionId?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_addReaction: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    reactionType?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_removeReaction: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_getUserReactions: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_getAnalytics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_checkUserVoted: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                pollId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    confessions_getRandomConfession: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    dashboard_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    events_listEvents: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
                type?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    events_createEvent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    title?: unknown;
                    description?: unknown;
                    location?: unknown;
                    eventDate?: unknown;
                    type?: unknown;
                    clubName?: unknown;
                    category?: unknown;
                    /** @description Object path from POST /api/uploads (purpose event); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    title?: unknown;
                    description?: unknown;
                    location?: unknown;
                    eventDate?: unknown;
                    type?: unknown;
                    clubName?: unknown;
                    category?: unknown;
                    /** @description Object path from POST /api/uploads (purpose event); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    image?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    events_updateEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    eventDate?: unknown;
                    /** @description Object path from POST /api/uploads (purpose event); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    eventDate?: unknown;
                    /** @description Object path from POST /api/uploads (purpose event); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    image?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    events_deleteEvent: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    events_updateRsvp: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    status?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    feed_getUserFeed: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
                category?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostListEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    health_get: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The service is up. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HealthStatus"];
                };
            };
            500: components["responses"]["E500"];
        };
    };
    issueReports_createIssueReport: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    name?: unknown;
                    email?: unknown;
                    issueType?: unknown;
                    description?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_getAllJobs: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
                type?: unknown;
                search?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_createJob: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_getJobById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_updateJob: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_deleteJob: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_getUserApplicationStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_getJobApplications: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_getApplicationCount: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_applyToJob: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_removeApplication: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_getCommentsByJobId: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_createComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    content?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_createReply: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                commentId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    content?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_getCommentById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                commentId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_updateComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                commentId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    content?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    jobs_deleteComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                commentId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    lostAndFound_getAllPosts: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
                type?: unknown;
                status?: unknown;
                search?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    lostAndFound_createPost: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    /** @description Object path from POST /api/uploads (purpose lostFound); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    /** @description Object path from POST /api/uploads (purpose lostFound); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    image?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    lostAndFound_getPostById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                postId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    lostAndFound_deletePost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                postId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    lostAndFound_updatePost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                postId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    type?: unknown;
                    occurredAt?: unknown;
                    privacyAccepted?: unknown;
                    /** @description Object path from POST /api/uploads (purpose lostFound); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    type?: unknown;
                    occurredAt?: unknown;
                    privacyAccepted?: unknown;
                    /** @description Object path from POST /api/uploads (purpose lostFound); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    image?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    lostAndFound_markAsActive: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                postId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    lostAndFound_markAsResolved: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                postId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    moderation_disclosePostIdentity: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                postId: number;
            };
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    reportId?: unknown;
                    justification?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posts_getPosts: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
                category?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostListEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posts_createPost: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PostWriteRequest"];
                "multipart/form-data": components["schemas"]["PostWriteRequest"] & {
                    /** Format: binary */
                    image?: string;
                };
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posts_getPost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posts_updatePost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PostWriteRequest"];
                "multipart/form-data": components["schemas"]["PostWriteRequest"] & {
                    /** Format: binary */
                    image?: string;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posts_deletePost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MessageEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posts_getPostComments: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
            };
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommentListEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posts_createComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommentCreateRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CommentEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    posts_reactToPost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PostReactRequest"];
            };
        };
        responses: {
            /** @description Reaction updated or removed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostReactResponse"];
                };
            };
            /** @description Reaction added */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PostReactResponse"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_getOwnProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerUserEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_updateProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileUpdateRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_createProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileUpdateRequest"];
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profileReferenceData_getProfileReferenceData: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProfileReferenceDataEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_getProfile: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Bare body. The caller's own id returns the OwnerUser superset. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicUser"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_deleteCoverPicture: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BareMessage"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_getCoverPicture: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirect to a signed or public file URL */
            302: {
                headers: {
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_getOwnProfileMe: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OwnerUserEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_patchOwnProfile: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProfileUpdateRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_deleteProfilePicture: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BareMessage"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_getProfilePicture: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirect to a signed or public file URL */
            302: {
                headers: {
                    Location?: string;
                    [name: string]: unknown;
                };
                content?: never;
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_uploadCoverPicture: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Object path from POST /api/uploads (purpose cover); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    /** @description Object path from POST /api/uploads (purpose cover); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    coverPicture?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PictureUploadResponse"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    profile_uploadProfilePicture: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Object path from POST /api/uploads (purpose avatar); alternative to sending the file. */
                    uploadPath?: string;
                } & {
                    [key: string]: unknown;
                };
                "multipart/form-data": {
                    /** @description Object path from POST /api/uploads (purpose avatar); alternative to sending the file. */
                    uploadPath?: string;
                    /** Format: binary */
                    profilePicture?: string;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PictureUploadResponse"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    reports_reportsList: {
        parameters: {
            query?: {
                /** @description 1-based page number. Values below 1 or non-numeric values fall back to 1. */
                page?: components["parameters"]["Page"];
                /** @description Page size. The default and the maximum differ per endpoint (defaults 10 to 20, maximums 50 or 100); out-of-range values are clamped by the server rather than rejected. */
                limit?: components["parameters"]["Limit"];
                status?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    reports_reportCreate: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    entityId?: unknown;
                    entityKind?: unknown;
                    reason?: unknown;
                    details?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    reports_reportUpdate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    savedItems_savedStatus: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                kind: "post" | "comment" | "resource" | "job" | "lost_found" | "confession" | "cat_post" | "event";
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    savedItems_savedCreate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                kind: "post" | "comment" | "resource" | "job" | "lost_found" | "confession" | "cat_post" | "event";
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    savedItems_savedDelete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                kind: "post" | "comment" | "resource" | "job" | "lost_found" | "confession" | "cat_post" | "event";
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    search_search: {
        parameters: {
            query?: {
                q?: unknown;
                type?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    uploads_createUploadIntent: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UploadIntentRequest"];
            };
        };
        responses: {
            /** @description Created */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UploadIntentEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    user_updateUserName: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserNameRequest"];
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UpdateUserNameResponse"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    user_getUserById: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicUserEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    user_getUserByStudentId: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                studentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    user_getStudentId: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    user_updateStudentId: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": {
                    studentId?: unknown;
                } & {
                    [key: string]: unknown;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            409: components["responses"]["E409"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    user_deleteStudentId: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["GenericObject"];
                };
            };
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            404: components["responses"]["E404"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    user_checkStudentIdAvailability: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                studentId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SuccessEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
    users_searchUsers: {
        parameters: {
            query?: {
                q?: unknown;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PublicUserListEnvelope"];
                };
            };
            400: components["responses"]["E400"];
            401: components["responses"]["E401"];
            403: components["responses"]["E403"];
            429: components["responses"]["E429"];
            500: components["responses"]["E500"];
        };
    };
}
