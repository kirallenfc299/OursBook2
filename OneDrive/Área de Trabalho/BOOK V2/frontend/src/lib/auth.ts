import { supabase } from './supabase';
import type { User } from './supabase';

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  needsVerification?: boolean;
}

export class AuthService {
  // Sign up with email verification
  static async signUp(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      // First, sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            subscription_tier: 'basic',
            is_admin: false
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          return { success: false, message: 'Este email já está cadastrado. Faça login ou use outro email.' };
        }
        return { success: false, message: authError.message };
      }

      if (!authData.user) {
        return { success: false, message: 'Erro ao criar conta. Tente novamente.' };
      }

      // If email confirmation is required
      if (!authData.session) {
        return { 
          success: true, 
          message: 'Conta criada! Verifique seu email para confirmar o cadastro.',
          needsVerification: true
        };
      }

      // Create user profile in our custom table
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: authData.user.email,
            name: name,
            subscription_tier: 'basic',
            is_admin: false,
            email_verified: authData.user.email_confirmed_at ? true : false
          }
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway, profile might already exist
      }

      const user: User = {
        id: authData.user.id,
        email: authData.user.email!,
        name: name,
        subscription_tier: 'basic',
        is_admin: false,
        email_verified: authData.user.email_confirmed_at ? true : false,
        created_at: authData.user.created_at,
        updated_at: new Date().toISOString()
      };

      return { success: true, message: 'Conta criada com sucesso!', user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    }
  }

  // Sign in
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, message: 'Email ou senha incorretos.' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, message: 'Verifique seu email antes de fazer login.' };
        }
        return { success: false, message: error.message };
      }

      if (!data.user) {
        return { success: false, message: 'Erro ao fazer login. Tente novamente.' };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Create profile if it doesn't exist
        const { error: createError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || 'Usuário',
              subscription_tier: 'basic',
              is_admin: false,
              email_verified: data.user.email_confirmed_at ? true : false
            }
          ]);

        if (createError) {
          console.error('Profile creation error:', createError);
        }
      }

      const user: User = profile || {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || 'Usuário',
        subscription_tier: 'basic',
        is_admin: false,
        email_verified: data.user.email_confirmed_at ? true : false,
        created_at: data.user.created_at,
        updated_at: new Date().toISOString()
      };

      return { success: true, message: 'Login realizado com sucesso!', user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, message: 'Logout realizado com sucesso!' };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, message: 'Erro ao fazer logout.' };
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { 
        success: true, 
        message: 'Email de recuperação enviado! Verifique sua caixa de entrada.' 
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Erro ao enviar email de recuperação.' };
    }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: 'Senha atualizada com sucesso!' };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, message: 'Erro ao atualizar senha.' };
    }
  }

  // Resend verification email
  static async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { 
        success: true, 
        message: 'Email de verificação reenviado! Verifique sua caixa de entrada.' 
      };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'Erro ao reenviar email de verificação.' };
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 3000);
      });

      const userPromise = supabase.auth.getUser();
      
      const { data: { user } } = await Promise.race([userPromise, timeoutPromise]);
      
      if (!user) return null;

      // Try to get profile, but don't fail if it doesn't exist
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        return profile || {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || 'Usuário',
          subscription_tier: 'basic',
          is_admin: false,
          email_verified: user.email_confirmed_at ? true : false,
          created_at: user.created_at,
          updated_at: new Date().toISOString()
        };
      } catch (profileError) {
        console.warn('Could not fetch user profile, using auth data:', profileError);
        return {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || 'Usuário',
          subscription_tier: 'basic',
          is_admin: false,
          email_verified: user.email_confirmed_at ? true : false,
          created_at: user.created_at,
          updated_at: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  }
}