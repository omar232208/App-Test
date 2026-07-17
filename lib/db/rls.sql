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
