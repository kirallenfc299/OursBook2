-- OursBook Database Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('basic', 'premium', 'ultimate');
CREATE TYPE list_type AS ENUM ('favorites', 'reading_list', 'currently_reading', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    profile_picture TEXT,
    subscription_tier subscription_tier DEFAULT 'basic',
    is_admin BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    genre TEXT[] DEFAULT '{}',
    cover_image_url TEXT,
    file_url TEXT,
    file_format TEXT DEFAULT 'pdf',
    file_size BIGINT,
    page_count INTEGER,
    isbn TEXT,
    language TEXT DEFAULT 'en',
    publication_date TEXT,
    publisher TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User books relationship table
CREATE TABLE IF NOT EXISTS public.user_books (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    list_type list_type NOT NULL,
    progress DECIMAL(5,2) DEFAULT 0,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id, list_type)
);

-- Book categories table
CREATE TABLE IF NOT EXISTS public.book_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading sessions table (for tracking reading progress)
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    pages_read INTEGER DEFAULT 0,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book reviews table
CREATE TABLE IF NOT EXISTS public.book_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review_text TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books USING gin(to_tsvector('english', author));
CREATE INDEX IF NOT EXISTS idx_books_genre ON public.books USING gin(genre);
CREATE INDEX IF NOT EXISTS idx_books_featured ON public.books(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_books_view_count ON public.books(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON public.books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON public.user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_book_id ON public.user_books(book_id);
CREATE INDEX IF NOT EXISTS idx_user_books_list_type ON public.user_books(list_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_books_updated_at BEFORE UPDATE ON public.user_books FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_book_reviews_updated_at BEFORE UPDATE ON public.book_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Books policies (public read, admin write)
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT USING (TRUE);
CREATE POLICY "Admins can insert books" ON public.books FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can update books" ON public.books FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);
CREATE POLICY "Admins can delete books" ON public.books FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);

-- User books policies
CREATE POLICY "Users can manage their own book lists" ON public.user_books FOR ALL USING (auth.uid() = user_id);

-- Book categories policies
CREATE POLICY "Anyone can view categories" ON public.book_categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage categories" ON public.book_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Reading sessions policies
CREATE POLICY "Users can manage their own reading sessions" ON public.reading_sessions FOR ALL USING (auth.uid() = user_id);

-- Book reviews policies
CREATE POLICY "Anyone can view public reviews" ON public.book_reviews FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can view their own reviews" ON public.book_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own reviews" ON public.book_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.book_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.book_reviews FOR DELETE USING (auth.uid() = user_id);

-- Insert default book categories
INSERT INTO public.book_categories (name, description) VALUES
    ('Fiction', 'Fictional literature and novels'),
    ('Non-Fiction', 'Factual and educational books'),
    ('Science Fiction', 'Science fiction and futuristic stories'),
    ('Fantasy', 'Fantasy and magical stories'),
    ('Mystery', 'Mystery and detective stories'),
    ('Romance', 'Romantic literature'),
    ('Thriller', 'Thriller and suspense books'),
    ('Biography', 'Biographical and autobiographical works'),
    ('History', 'Historical books and accounts'),
    ('Science', 'Scientific and technical books'),
    ('Technology', 'Technology and programming books'),
    ('Business', 'Business and entrepreneurship'),
    ('Self-Help', 'Self-improvement and personal development'),
    ('Health', 'Health and wellness books'),
    ('Travel', 'Travel guides and adventure stories'),
    ('Cooking', 'Cookbooks and culinary arts'),
    ('Art', 'Art and design books'),
    ('Music', 'Music theory and biographies'),
    ('Sports', 'Sports and fitness books'),
    ('Children', 'Children and young adult books')
ON CONFLICT (name) DO NOTHING;

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Storage policies for book files
INSERT INTO storage.buckets (id, name, public) VALUES ('Book', 'Book', true) ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload book files" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'Book' AND auth.role() = 'authenticated'
);

-- Allow public access to book files
CREATE POLICY "Public access to book files" ON storage.objects FOR SELECT USING (bucket_id = 'Book');

-- Allow admins to delete book files
CREATE POLICY "Admins can delete book files" ON storage.objects FOR DELETE USING (
    bucket_id = 'Book' AND 
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
);