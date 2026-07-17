-- Drop existing policies first (safe for re-runs)
DO $$ DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- Projects: users can CRUD own rows
CREATE POLICY "users_select_own_projects" ON projects FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_projects" ON projects FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_projects" ON projects FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_projects" ON projects FOR DELETE USING (auth.uid()::text = user_id);

-- Tasks
CREATE POLICY "users_select_own_tasks" ON tasks FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_tasks" ON tasks FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_tasks" ON tasks FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_tasks" ON tasks FOR DELETE USING (auth.uid()::text = user_id);

-- Notes
CREATE POLICY "users_select_own_notes" ON notes FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_notes" ON notes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_notes" ON notes FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_notes" ON notes FOR DELETE USING (auth.uid()::text = user_id);

-- Folders
CREATE POLICY "users_select_own_folders" ON folders FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_folders" ON folders FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_folders" ON folders FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_folders" ON folders FOR DELETE USING (auth.uid()::text = user_id);

-- Folder Docs
CREATE POLICY "users_select_own_folder_docs" ON folder_docs FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_folder_docs" ON folder_docs FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_folder_docs" ON folder_docs FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_folder_docs" ON folder_docs FOR DELETE USING (auth.uid()::text = user_id);

-- Saved Images
CREATE POLICY "users_select_own_saved_images" ON saved_images FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_saved_images" ON saved_images FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_saved_images" ON saved_images FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_saved_images" ON saved_images FOR DELETE USING (auth.uid()::text = user_id);

-- Bookmarks
CREATE POLICY "users_select_own_bookmarks" ON bookmarks FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_bookmarks" ON bookmarks FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_bookmarks" ON bookmarks FOR DELETE USING (auth.uid()::text = user_id);

-- AI Messages
CREATE POLICY "users_select_own_ai_messages" ON ai_messages FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_ai_messages" ON ai_messages FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_ai_messages" ON ai_messages FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_ai_messages" ON ai_messages FOR DELETE USING (auth.uid()::text = user_id);

-- ========== NEW TABLES ==========

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- AI Agents
CREATE POLICY "users_select_own_ai_agents" ON ai_agents FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_ai_agents" ON ai_agents FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_ai_agents" ON ai_agents FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_ai_agents" ON ai_agents FOR DELETE USING (auth.uid()::text = user_id);

-- Agent Tasks
CREATE POLICY "users_select_own_agent_tasks" ON agent_tasks FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_agent_tasks" ON agent_tasks FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_agent_tasks" ON agent_tasks FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_agent_tasks" ON agent_tasks FOR DELETE USING (auth.uid()::text = user_id);

-- Activity Log
CREATE POLICY "users_select_own_activity_log" ON activity_log FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_activity_log" ON activity_log FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Notifications
CREATE POLICY "users_select_own_notifications" ON notifications FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_notifications" ON notifications FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_notifications" ON notifications FOR DELETE USING (auth.uid()::text = user_id);

-- Community Posts (public read, authenticated write)
CREATE POLICY "public_select_posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "users_insert_own_posts" ON community_posts FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_posts" ON community_posts FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_posts" ON community_posts FOR DELETE USING (auth.uid()::text = user_id);

-- Community Comments
CREATE POLICY "public_select_comments" ON community_comments FOR SELECT USING (true);
CREATE POLICY "users_insert_own_comments" ON community_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_comments" ON community_comments FOR DELETE USING (auth.uid()::text = user_id);

-- Community Likes
CREATE POLICY "public_select_likes" ON community_likes FOR SELECT USING (true);
CREATE POLICY "users_insert_own_likes" ON community_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_likes" ON community_likes FOR DELETE USING (auth.uid()::text = user_id);

-- Community Follows
CREATE POLICY "public_select_follows" ON community_follows FOR SELECT USING (true);
CREATE POLICY "users_insert_own_follows" ON community_follows FOR INSERT WITH CHECK (auth.uid()::text = follower_id);
CREATE POLICY "users_delete_own_follows" ON community_follows FOR DELETE USING (auth.uid()::text = follower_id);

-- Cloud Files
CREATE POLICY "users_select_own_cloud_files" ON cloud_files FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_cloud_files" ON cloud_files FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_cloud_files" ON cloud_files FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_cloud_files" ON cloud_files FOR DELETE USING (auth.uid()::text = user_id);

-- Deployments
CREATE POLICY "users_select_own_deployments" ON deployments FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_deployments" ON deployments FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_deployments" ON deployments FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_deployments" ON deployments FOR DELETE USING (auth.uid()::text = user_id);

-- Sessions
CREATE POLICY "users_select_own_sessions" ON sessions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_sessions" ON sessions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_sessions" ON sessions FOR DELETE USING (auth.uid()::text = user_id);

-- API Keys
CREATE POLICY "users_select_own_api_keys" ON api_keys FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_api_keys" ON api_keys FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_api_keys" ON api_keys FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_api_keys" ON api_keys FOR DELETE USING (auth.uid()::text = user_id);

-- Subscriptions
CREATE POLICY "users_select_own_subscriptions" ON subscriptions FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_subscriptions" ON subscriptions FOR UPDATE USING (auth.uid()::text = user_id);

-- Calendar Events
CREATE POLICY "users_select_own_calendar_events" ON calendar_events FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_calendar_events" ON calendar_events FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_calendar_events" ON calendar_events FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_calendar_events" ON calendar_events FOR DELETE USING (auth.uid()::text = user_id);

-- Meetings
CREATE POLICY "users_select_own_meetings" ON meetings FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_meetings" ON meetings FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_meetings" ON meetings FOR DELETE USING (auth.uid()::text = user_id);

-- Time Tracking
CREATE POLICY "users_select_own_time_tracking" ON time_tracking FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_time_tracking" ON time_tracking FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_time_tracking" ON time_tracking FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "users_delete_own_time_tracking" ON time_tracking FOR DELETE USING (auth.uid()::text = user_id);

-- User Stats
CREATE POLICY "users_select_own_user_stats" ON user_stats FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "users_insert_own_user_stats" ON user_stats FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "users_update_own_user_stats" ON user_stats FOR UPDATE USING (auth.uid()::text = user_id);
