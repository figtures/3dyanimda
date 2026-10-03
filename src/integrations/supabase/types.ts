export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      landing_pages: {
        Row: {
          id: string;
          tenant_id: string;
          path: string;
          title: string;
          summary: string;
          kind: string;
          image: string;
          sections: Json;
          faq: Json;
          status: string;
          city: string;
          district: string;
          neighborhood: string;
          service: string;
          local_context: string;
          logistics: string;
          evidence: string;
          reviewed_at: string | null;
          updated_at: string;
        };
        Insert: {
          tenant_id?: string;
          path: string;
          title: string;
          kind: string;
          id?: string;
          summary?: string;
          image?: string;
          sections?: Json;
          faq?: Json;
          status?: string;
          city?: string;
          district?: string;
          neighborhood?: string;
          service?: string;
          local_context?: string;
          logistics?: string;
          evidence?: string;
          reviewed_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["landing_pages"]["Insert"]
        >;
        Relationships: [];
      };
      announcements: {
        Row: {
          active: boolean;
          created_at: string;
          ends_at: string | null;
          id: string;
          link_label_en: string | null;
          link_label_tr: string | null;
          link_url: string | null;
          message_en: string | null;
          message_tr: string;
          sort_order: number;
          starts_at: string | null;
          tenant_id: string;
          updated_at: string;
          variant: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          link_label_en?: string | null;
          link_label_tr?: string | null;
          link_url?: string | null;
          message_en?: string | null;
          message_tr: string;
          sort_order?: number;
          starts_at?: string | null;
          tenant_id: string;
          updated_at?: string;
          variant?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          ends_at?: string | null;
          id?: string;
          link_label_en?: string | null;
          link_label_tr?: string | null;
          link_url?: string | null;
          message_en?: string | null;
          message_tr?: string;
          sort_order?: number;
          starts_at?: string | null;
          tenant_id?: string;
          updated_at?: string;
          variant?: string;
        };
        Relationships: [
          {
            foreignKeyName: "announcements_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          created_at: string;
          details: Json | null;
          id: string;
          record_id: string | null;
          table_name: string;
          tenant_id: string;
          user_email: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          record_id?: string | null;
          table_name: string;
          tenant_id: string;
          user_email?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          details?: Json | null;
          id?: string;
          record_id?: string | null;
          table_name?: string;
          tenant_id?: string;
          user_email?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_posts: {
        Row: {
          author_id: string | null;
          content: string;
          content_en: string | null;
          cover_image_url: string | null;
          created_at: string;
          excerpt: string | null;
          excerpt_en: string | null;
          id: string;
          published: boolean;
          published_at: string | null;
          slug: string;
          tags: string[] | null;
          tenant_id: string;
          title: string;
          title_en: string | null;
          updated_at: string;
        };
        Insert: {
          author_id?: string | null;
          content?: string;
          content_en?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          excerpt_en?: string | null;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          slug: string;
          tags?: string[] | null;
          tenant_id: string;
          title: string;
          title_en?: string | null;
          updated_at?: string;
        };
        Update: {
          author_id?: string | null;
          content?: string;
          content_en?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt?: string | null;
          excerpt_en?: string | null;
          id?: string;
          published?: boolean;
          published_at?: string | null;
          slug?: string;
          tags?: string[] | null;
          tenant_id?: string;
          title?: string;
          title_en?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "blog_posts_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      collection_items: {
        Row: {
          collection_id: string;
          created_at: string;
          data: Json;
          id: string;
          seo: Json | null;
          slug: string;
          sort_order: number;
          status: string;
          tenant_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          collection_id: string;
          created_at?: string;
          data?: Json;
          id?: string;
          seo?: Json | null;
          slug: string;
          sort_order?: number;
          status?: string;
          tenant_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          collection_id?: string;
          created_at?: string;
          data?: Json;
          id?: string;
          seo?: Json | null;
          slug?: string;
          sort_order?: number;
          status?: string;
          tenant_id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "collection_items_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          name: string;
          schema: Json;
          slug: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name: string;
          schema?: Json;
          slug: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
          schema?: Json;
          slug?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collections_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: {
          admin_notes: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          message: string;
          phone: string | null;
          status: string;
          subject: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          message: string;
          phone?: string | null;
          status?: string;
          subject?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          message?: string;
          phone?: string | null;
          status?: string;
          subject?: string | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contact_messages_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      discount_campaigns: {
        Row: {
          active: boolean;
          badge: string | null;
          countdown_seconds: number;
          created_at: string;
          discount_type: string;
          discount_value: number;
          id: string;
          message: string;
          min_quantity: number;
          min_quote_amount: number;
          name: string;
          sort_order: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          badge?: string | null;
          countdown_seconds?: number;
          created_at?: string;
          discount_type?: string;
          discount_value?: number;
          id?: string;
          message?: string;
          min_quantity?: number;
          min_quote_amount?: number;
          name: string;
          sort_order?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          badge?: string | null;
          countdown_seconds?: number;
          created_at?: string;
          discount_type?: string;
          discount_value?: number;
          id?: string;
          message?: string;
          min_quantity?: number;
          min_quote_amount?: number;
          name?: string;
          sort_order?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "discount_campaigns_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      email_templates: {
        Row: {
          active: boolean;
          body_en: string;
          body_tr: string;
          created_at: string;
          description: string | null;
          id: string;
          key: string;
          subject_en: string;
          subject_tr: string;
          tenant_id: string;
          updated_at: string;
          variables: string[];
        };
        Insert: {
          active?: boolean;
          body_en?: string;
          body_tr?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          key: string;
          subject_en?: string;
          subject_tr?: string;
          tenant_id: string;
          updated_at?: string;
          variables?: string[];
        };
        Update: {
          active?: boolean;
          body_en?: string;
          body_tr?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          key?: string;
          subject_en?: string;
          subject_tr?: string;
          tenant_id?: string;
          updated_at?: string;
          variables?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "email_templates_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      faq_items: {
        Row: {
          active: boolean;
          answer_en: string | null;
          answer_tr: string;
          category: string | null;
          created_at: string;
          id: string;
          question_en: string | null;
          question_tr: string;
          sort_order: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          answer_en?: string | null;
          answer_tr: string;
          category?: string | null;
          created_at?: string;
          id?: string;
          question_en?: string | null;
          question_tr: string;
          sort_order?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          answer_en?: string | null;
          answer_tr?: string;
          category?: string | null;
          created_at?: string;
          id?: string;
          question_en?: string | null;
          question_tr?: string;
          sort_order?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "faq_items_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      features: {
        Row: {
          category: string;
          created_at: string;
          default_enabled: boolean;
          description: string | null;
          key: string;
          label: string;
          parent_key: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category?: string;
          created_at?: string;
          default_enabled?: boolean;
          description?: string | null;
          key: string;
          label: string;
          parent_key?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          default_enabled?: boolean;
          description?: string | null;
          key?: string;
          label?: string;
          parent_key?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "features_parent_key_fkey";
            columns: ["parent_key"];
            isOneToOne: false;
            referencedRelation: "features";
            referencedColumns: ["key"];
          },
        ];
      };
      job_applications: {
        Row: {
          admin_notes: string | null;
          cover_letter: string | null;
          created_at: string;
          cv_file_name: string | null;
          cv_file_path: string | null;
          email: string;
          experience_years: number | null;
          full_name: string;
          id: string;
          kvkk_consent: boolean;
          linkedin_url: string | null;
          phone: string | null;
          portfolio_url: string | null;
          position: string;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          cover_letter?: string | null;
          created_at?: string;
          cv_file_name?: string | null;
          cv_file_path?: string | null;
          email: string;
          experience_years?: number | null;
          full_name: string;
          id?: string;
          kvkk_consent?: boolean;
          linkedin_url?: string | null;
          phone?: string | null;
          portfolio_url?: string | null;
          position: string;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          cover_letter?: string | null;
          created_at?: string;
          cv_file_name?: string | null;
          cv_file_path?: string | null;
          email?: string;
          experience_years?: number | null;
          full_name?: string;
          id?: string;
          kvkk_consent?: boolean;
          linkedin_url?: string | null;
          phone?: string | null;
          portfolio_url?: string | null;
          position?: string;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      job_postings: {
        Row: {
          active: boolean;
          created_at: string;
          department: string | null;
          description_en: string | null;
          description_tr: string | null;
          employment_type: string | null;
          icon: string | null;
          id: string;
          level: string | null;
          location: string | null;
          requirements_en: string | null;
          requirements_tr: string | null;
          slug: string;
          sort_order: number;
          summary_en: string | null;
          summary_tr: string | null;
          tenant_id: string;
          title_en: string | null;
          title_tr: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          department?: string | null;
          description_en?: string | null;
          description_tr?: string | null;
          employment_type?: string | null;
          icon?: string | null;
          id?: string;
          level?: string | null;
          location?: string | null;
          requirements_en?: string | null;
          requirements_tr?: string | null;
          slug: string;
          sort_order?: number;
          summary_en?: string | null;
          summary_tr?: string | null;
          tenant_id: string;
          title_en?: string | null;
          title_tr: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          department?: string | null;
          description_en?: string | null;
          description_tr?: string | null;
          employment_type?: string | null;
          icon?: string | null;
          id?: string;
          level?: string | null;
          location?: string | null;
          requirements_en?: string | null;
          requirements_tr?: string | null;
          slug?: string;
          sort_order?: number;
          summary_en?: string | null;
          summary_tr?: string | null;
          tenant_id?: string;
          title_en?: string | null;
          title_tr?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_postings_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      legal_documents: {
        Row: {
          content_en: string | null;
          content_tr: string;
          created_at: string;
          effective_date: string | null;
          id: string;
          slug: string;
          tenant_id: string;
          title_en: string | null;
          title_tr: string;
          updated_at: string;
        };
        Insert: {
          content_en?: string | null;
          content_tr?: string;
          created_at?: string;
          effective_date?: string | null;
          id?: string;
          slug: string;
          tenant_id: string;
          title_en?: string | null;
          title_tr: string;
          updated_at?: string;
        };
        Update: {
          content_en?: string | null;
          content_tr?: string;
          created_at?: string;
          effective_date?: string | null;
          id?: string;
          slug?: string;
          tenant_id?: string;
          title_en?: string | null;
          title_tr?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "legal_documents_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      machine_operation_requests: {
        Row: {
          admin_notes: string | null;
          attachment_name: string | null;
          attachment_path: string | null;
          build_volume: string | null;
          company: string | null;
          created_at: string;
          current_location: string | null;
          details: string | null;
          email: string;
          expected_volume: string | null;
          full_name: string;
          id: string;
          kvkk_consent: boolean;
          machine_brand: string;
          machine_model: string;
          machine_type: string;
          phone: string | null;
          service_scope: string[] | null;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          admin_notes?: string | null;
          attachment_name?: string | null;
          attachment_path?: string | null;
          build_volume?: string | null;
          company?: string | null;
          created_at?: string;
          current_location?: string | null;
          details?: string | null;
          email: string;
          expected_volume?: string | null;
          full_name: string;
          id?: string;
          kvkk_consent?: boolean;
          machine_brand: string;
          machine_model: string;
          machine_type: string;
          phone?: string | null;
          service_scope?: string[] | null;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          admin_notes?: string | null;
          attachment_name?: string | null;
          attachment_path?: string | null;
          build_volume?: string | null;
          company?: string | null;
          created_at?: string;
          current_location?: string | null;
          details?: string | null;
          email?: string;
          expected_volume?: string | null;
          full_name?: string;
          id?: string;
          kvkk_consent?: boolean;
          machine_brand?: string;
          machine_model?: string;
          machine_type?: string;
          phone?: string | null;
          service_scope?: string[] | null;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "machine_operation_requests_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      materials: {
        Row: {
          active: boolean;
          color: string | null;
          created_at: string;
          density_g_cm3: number;
          description: string | null;
          id: string;
          min_price: number;
          name: string;
          price_per_gram: number;
          setup_fee: number;
          sort_order: number;
          technology: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          color?: string | null;
          created_at?: string;
          density_g_cm3?: number;
          description?: string | null;
          id?: string;
          min_price?: number;
          name: string;
          price_per_gram?: number;
          setup_fee?: number;
          sort_order?: number;
          technology: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          color?: string | null;
          created_at?: string;
          density_g_cm3?: number;
          description?: string | null;
          id?: string;
          min_price?: number;
          name?: string;
          price_per_gram?: number;
          setup_fee?: number;
          sort_order?: number;
          technology?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "materials_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      media_library: {
        Row: {
          alt_en: string | null;
          alt_tr: string | null;
          category: string | null;
          created_at: string;
          filename: string;
          height: number | null;
          id: string;
          mime_type: string | null;
          public_url: string;
          size_bytes: number | null;
          storage_path: string;
          tags: string[] | null;
          tenant_id: string;
          uploaded_by: string | null;
          width: number | null;
        };
        Insert: {
          alt_en?: string | null;
          alt_tr?: string | null;
          category?: string | null;
          created_at?: string;
          filename: string;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          public_url: string;
          size_bytes?: number | null;
          storage_path: string;
          tags?: string[] | null;
          tenant_id: string;
          uploaded_by?: string | null;
          width?: number | null;
        };
        Update: {
          alt_en?: string | null;
          alt_tr?: string | null;
          category?: string | null;
          created_at?: string;
          filename?: string;
          height?: number | null;
          id?: string;
          mime_type?: string | null;
          public_url?: string;
          size_bytes?: number | null;
          storage_path?: string;
          tags?: string[] | null;
          tenant_id?: string;
          uploaded_by?: string | null;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_library_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      nav_items: {
        Row: {
          active: boolean;
          badge: string | null;
          created_at: string;
          description_en: string | null;
          description_tr: string | null;
          id: string;
          label_en: string | null;
          label_tr: string;
          location: string;
          parent: string | null;
          sort_order: number;
          tenant_id: string;
          updated_at: string;
          url: string;
        };
        Insert: {
          active?: boolean;
          badge?: string | null;
          created_at?: string;
          description_en?: string | null;
          description_tr?: string | null;
          id?: string;
          label_en?: string | null;
          label_tr: string;
          location: string;
          parent?: string | null;
          sort_order?: number;
          tenant_id: string;
          updated_at?: string;
          url: string;
        };
        Update: {
          active?: boolean;
          badge?: string | null;
          created_at?: string;
          description_en?: string | null;
          description_tr?: string | null;
          id?: string;
          label_en?: string | null;
          label_tr?: string;
          location?: string;
          parent?: string | null;
          sort_order?: number;
          tenant_id?: string;
          updated_at?: string;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "nav_items_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          source: string | null;
          status: string;
          tenant_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          source?: string | null;
          status?: string;
          tenant_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          source?: string | null;
          status?: string;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "newsletter_subscribers_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      page_blocks: {
        Row: {
          created_at: string;
          data: Json;
          id: string;
          is_visible: boolean;
          page_id: string;
          position: number;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          data?: Json;
          id?: string;
          is_visible?: boolean;
          page_id: string;
          position?: number;
          type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          data?: Json;
          id?: string;
          is_visible?: boolean;
          page_id?: string;
          position?: number;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_blocks_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      page_translations: {
        Row: {
          block_overrides: Json;
          created_at: string;
          id: string;
          locale: string;
          meta: Json;
          page_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          block_overrides?: Json;
          created_at?: string;
          id?: string;
          locale: string;
          meta?: Json;
          page_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          block_overrides?: Json;
          created_at?: string;
          id?: string;
          locale?: string;
          meta?: Json;
          page_id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "page_translations_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
        ];
      };
      pages: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          locale_default: string;
          meta: Json;
          slug: string;
          status: string;
          template: string;
          tenant_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          locale_default?: string;
          meta?: Json;
          slug: string;
          status?: string;
          template?: string;
          tenant_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          locale_default?: string;
          meta?: Json;
          slug?: string;
          status?: string;
          template?: string;
          tenant_id?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pages_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolio_projects: {
        Row: {
          content_en: string | null;
          content_tr: string | null;
          cover_image_url: string | null;
          created_at: string;
          excerpt_en: string | null;
          excerpt_tr: string | null;
          gallery: Json;
          id: string;
          industry: string | null;
          materials: string[] | null;
          published: boolean;
          published_at: string | null;
          slug: string;
          sort_order: number;
          tags: string[] | null;
          tenant_id: string;
          title_en: string | null;
          title_tr: string;
          updated_at: string;
        };
        Insert: {
          content_en?: string | null;
          content_tr?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt_en?: string | null;
          excerpt_tr?: string | null;
          gallery?: Json;
          id?: string;
          industry?: string | null;
          materials?: string[] | null;
          published?: boolean;
          published_at?: string | null;
          slug: string;
          sort_order?: number;
          tags?: string[] | null;
          tenant_id: string;
          title_en?: string | null;
          title_tr: string;
          updated_at?: string;
        };
        Update: {
          content_en?: string | null;
          content_tr?: string | null;
          cover_image_url?: string | null;
          created_at?: string;
          excerpt_en?: string | null;
          excerpt_tr?: string | null;
          gallery?: Json;
          id?: string;
          industry?: string | null;
          materials?: string[] | null;
          published?: boolean;
          published_at?: string | null;
          slug?: string;
          sort_order?: number;
          tags?: string[] | null;
          tenant_id?: string;
          title_en?: string | null;
          title_tr?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      pricing_settings: {
        Row: {
          description: string | null;
          key: string;
          label: string;
          tenant_id: string;
          updated_at: string;
          value: number;
        };
        Insert: {
          description?: string | null;
          key: string;
          label: string;
          tenant_id: string;
          updated_at?: string;
          value: number;
        };
        Update: {
          description?: string | null;
          key?: string;
          label?: string;
          tenant_id?: string;
          updated_at?: string;
          value?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pricing_settings_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_replies: {
        Row: {
          body: string;
          channel: string;
          created_at: string;
          error_message: string | null;
          id: string;
          quote_id: string;
          status: string;
          subject: string | null;
          tenant_id: string;
          to_email: string;
          user_id: string | null;
        };
        Insert: {
          body: string;
          channel?: string;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          quote_id: string;
          status?: string;
          subject?: string | null;
          tenant_id: string;
          to_email: string;
          user_id?: string | null;
        };
        Update: {
          body?: string;
          channel?: string;
          created_at?: string;
          error_message?: string | null;
          id?: string;
          quote_id?: string;
          status?: string;
          subject?: string | null;
          tenant_id?: string;
          to_email?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quote_replies_quote_id_fkey";
            columns: ["quote_id"];
            isOneToOne: false;
            referencedRelation: "quote_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quote_replies_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      quote_requests: {
        Row: {
          admin_notes: string | null;
          applied_campaign_name: string | null;
          applied_discount_amount: number | null;
          archived: boolean;
          archived_at: string | null;
          company: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          last_reply_at: string | null;
          material_pref: string | null;
          part_description: string;
          phone: string | null;
          quantity: number | null;
          service_type: string | null;
          status: string;
          stl_file_name: string | null;
          stl_file_path: string | null;
          tenant_id: string;
        };
        Insert: {
          admin_notes?: string | null;
          applied_campaign_name?: string | null;
          applied_discount_amount?: number | null;
          archived?: boolean;
          archived_at?: string | null;
          company?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          last_reply_at?: string | null;
          material_pref?: string | null;
          part_description: string;
          phone?: string | null;
          quantity?: number | null;
          service_type?: string | null;
          status?: string;
          stl_file_name?: string | null;
          stl_file_path?: string | null;
          tenant_id: string;
        };
        Update: {
          admin_notes?: string | null;
          applied_campaign_name?: string | null;
          applied_discount_amount?: number | null;
          archived?: boolean;
          archived_at?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          last_reply_at?: string | null;
          material_pref?: string | null;
          part_description?: string;
          phone?: string | null;
          quantity?: number | null;
          service_type?: string | null;
          status?: string;
          stl_file_name?: string | null;
          stl_file_path?: string | null;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "quote_requests_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      route_templates: {
        Row: {
          collection_id: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          notes: string | null;
          param_mapping: Json;
          pattern: string;
          priority: number;
          template_page_id: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          collection_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          param_mapping?: Json;
          pattern: string;
          priority?: number;
          template_page_id?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          collection_id?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          notes?: string | null;
          param_mapping?: Json;
          pattern?: string;
          priority?: number;
          template_page_id?: string | null;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "route_templates_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "route_templates_template_page_id_fkey";
            columns: ["template_page_id"];
            isOneToOne: false;
            referencedRelation: "pages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "route_templates_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      seo_meta: {
        Row: {
          created_at: string;
          description_en: string | null;
          description_tr: string | null;
          id: string;
          keywords_en: string | null;
          keywords_tr: string | null;
          noindex: boolean;
          og_image_url: string | null;
          path: string;
          tenant_id: string;
          title_en: string | null;
          title_tr: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description_en?: string | null;
          description_tr?: string | null;
          id?: string;
          keywords_en?: string | null;
          keywords_tr?: string | null;
          noindex?: boolean;
          og_image_url?: string | null;
          path: string;
          tenant_id: string;
          title_en?: string | null;
          title_tr?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description_en?: string | null;
          description_tr?: string | null;
          id?: string;
          keywords_en?: string | null;
          keywords_tr?: string | null;
          noindex?: boolean;
          og_image_url?: string | null;
          path?: string;
          tenant_id?: string;
          title_en?: string | null;
          title_tr?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "seo_meta_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          key: string;
          tenant_id: string;
          updated_at: string;
          value: Json;
        };
        Insert: {
          key: string;
          tenant_id: string;
          updated_at?: string;
          value?: Json;
        };
        Update: {
          key?: string;
          tenant_id?: string;
          updated_at?: string;
          value?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "site_settings_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_features: {
        Row: {
          created_at: string;
          enabled: boolean;
          feature_key: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          feature_key: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          feature_key?: string;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_features_feature_key_fkey";
            columns: ["feature_key"];
            isOneToOne: false;
            referencedRelation: "features";
            referencedColumns: ["key"];
          },
          {
            foreignKeyName: "tenant_features_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_system: boolean;
          name: string;
          permissions: string[];
          slug: string;
          tenant_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name: string;
          permissions?: string[];
          slug: string;
          tenant_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name?: string;
          permissions?: string[];
          slug?: string;
          tenant_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_roles_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenant_theme_config: {
        Row: {
          created_at: string;
          custom_overrides: Json;
          layout_slug: string | null;
          palette_slug: string | null;
          tenant_id: string;
          typography_slug: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          custom_overrides?: Json;
          layout_slug?: string | null;
          palette_slug?: string | null;
          tenant_id: string;
          typography_slug?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          custom_overrides?: Json;
          layout_slug?: string | null;
          palette_slug?: string | null;
          tenant_id?: string;
          typography_slug?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_theme_config_layout_slug_fkey";
            columns: ["layout_slug"];
            isOneToOne: false;
            referencedRelation: "theme_layouts";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "tenant_theme_config_palette_slug_fkey";
            columns: ["palette_slug"];
            isOneToOne: false;
            referencedRelation: "theme_palettes";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "tenant_theme_config_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: true;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_theme_config_typography_slug_fkey";
            columns: ["typography_slug"];
            isOneToOne: false;
            referencedRelation: "theme_typographies";
            referencedColumns: ["slug"];
          },
        ];
      };
      tenant_themes: {
        Row: {
          created_at: string;
          tenant_id: string;
          theme_slug: string;
        };
        Insert: {
          created_at?: string;
          tenant_id: string;
          theme_slug: string;
        };
        Update: {
          created_at?: string;
          tenant_id?: string;
          theme_slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_themes_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tenant_themes_theme_slug_fkey";
            columns: ["theme_slug"];
            isOneToOne: false;
            referencedRelation: "themes";
            referencedColumns: ["slug"];
          },
        ];
      };
      tenant_users: {
        Row: {
          created_at: string;
          extra_permissions: string[];
          id: string;
          invited_email: string | null;
          role_slug: string;
          status: string;
          tenant_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          extra_permissions?: string[];
          id?: string;
          invited_email?: string | null;
          role_slug?: string;
          status?: string;
          tenant_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          extra_permissions?: string[];
          id?: string;
          invited_email?: string | null;
          role_slug?: string;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          active_theme_slug: string | null;
          created_at: string;
          custom_domain: string | null;
          domain: string | null;
          id: string;
          logo_url: string | null;
          name: string;
          plan: string;
          settings: Json;
          slug: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          active_theme_slug?: string | null;
          created_at?: string;
          custom_domain?: string | null;
          domain?: string | null;
          id?: string;
          logo_url?: string | null;
          name: string;
          plan?: string;
          settings?: Json;
          slug: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          active_theme_slug?: string | null;
          created_at?: string;
          custom_domain?: string | null;
          domain?: string | null;
          id?: string;
          logo_url?: string | null;
          name?: string;
          plan?: string;
          settings?: Json;
          slug?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          active: boolean;
          author_name: string;
          author_title: string | null;
          avatar_url: string | null;
          company: string | null;
          created_at: string;
          id: string;
          quote_en: string | null;
          quote_tr: string;
          rating: number | null;
          sort_order: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          author_name: string;
          author_title?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          id?: string;
          quote_en?: string | null;
          quote_tr: string;
          rating?: number | null;
          sort_order?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          author_name?: string;
          author_title?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          created_at?: string;
          id?: string;
          quote_en?: string | null;
          quote_tr?: string;
          rating?: number | null;
          sort_order?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "testimonials_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      theme_layouts: {
        Row: {
          card_variant: string;
          config: Json;
          created_at: string;
          description: string | null;
          hero_variant: string;
          id: string;
          is_system: boolean;
          motion_intensity: string;
          name: string;
          nav_variant: string;
          preview_image: string | null;
          section_density: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          card_variant?: string;
          config?: Json;
          created_at?: string;
          description?: string | null;
          hero_variant?: string;
          id?: string;
          is_system?: boolean;
          motion_intensity?: string;
          name: string;
          nav_variant?: string;
          preview_image?: string | null;
          section_density?: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          card_variant?: string;
          config?: Json;
          created_at?: string;
          description?: string | null;
          hero_variant?: string;
          id?: string;
          is_system?: boolean;
          motion_intensity?: string;
          name?: string;
          nav_variant?: string;
          preview_image?: string | null;
          section_density?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      theme_palettes: {
        Row: {
          category: string | null;
          created_at: string;
          description: string | null;
          id: string;
          is_system: boolean;
          name: string;
          preview_image: string | null;
          slug: string;
          sort_order: number;
          tokens: Json;
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name: string;
          preview_image?: string | null;
          slug: string;
          sort_order?: number;
          tokens?: Json;
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          name?: string;
          preview_image?: string | null;
          slug?: string;
          sort_order?: number;
          tokens?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      theme_typographies: {
        Row: {
          body_font: string;
          created_at: string;
          description: string | null;
          google_fonts_url: string | null;
          heading_font: string;
          id: string;
          is_system: boolean;
          mono_font: string | null;
          name: string;
          scale: Json;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          body_font: string;
          created_at?: string;
          description?: string | null;
          google_fonts_url?: string | null;
          heading_font: string;
          id?: string;
          is_system?: boolean;
          mono_font?: string | null;
          name: string;
          scale?: Json;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          body_font?: string;
          created_at?: string;
          description?: string | null;
          google_fonts_url?: string | null;
          heading_font?: string;
          id?: string;
          is_system?: boolean;
          mono_font?: string | null;
          name?: string;
          scale?: Json;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      themes: {
        Row: {
          component_overrides: Json;
          created_at: string;
          description: string | null;
          is_system: boolean;
          layout_variant: string;
          name: string;
          preview_image: string | null;
          slug: string;
          tokens: Json;
          typography: Json;
          updated_at: string;
        };
        Insert: {
          component_overrides?: Json;
          created_at?: string;
          description?: string | null;
          is_system?: boolean;
          layout_variant?: string;
          name: string;
          preview_image?: string | null;
          slug: string;
          tokens?: Json;
          typography?: Json;
          updated_at?: string;
        };
        Update: {
          component_overrides?: Json;
          created_at?: string;
          description?: string | null;
          is_system?: boolean;
          layout_variant?: string;
          name?: string;
          preview_image?: string | null;
          slug?: string;
          tokens?: Json;
          typography?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      translations: {
        Row: {
          en: string;
          key: string;
          namespace: string;
          tenant_id: string;
          tr: string;
          updated_at: string;
        };
        Insert: {
          en?: string;
          key: string;
          namespace?: string;
          tenant_id: string;
          tr?: string;
          updated_at?: string;
        };
        Update: {
          en?: string;
          key?: string;
          namespace?: string;
          tenant_id?: string;
          tr?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "translations_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      url_redirects: {
        Row: {
          active: boolean;
          created_at: string;
          from_path: string;
          id: string;
          tenant_id: string;
          to_path: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          from_path: string;
          id?: string;
          tenant_id: string;
          to_path: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          from_path?: string;
          id?: string;
          tenant_id?: string;
          to_path?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "url_redirects_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      current_tenant_id: { Args: never; Returns: string };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_super_admin: { Args: { _user_id?: string }; Returns: boolean };
      is_tenant_member: {
        Args: { _tenant_id: string; _user_id?: string };
        Returns: boolean;
      };
      log_audit_event: {
        Args: {
          _action: string;
          _details?: Json;
          _record_id?: string;
          _table_name: string;
          _tenant_id: string;
        };
        Returns: string;
      };
      tenant_user_has_permission: {
        Args: { _permission: string; _tenant_id: string; _user_id?: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user" | "super_admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "super_admin"],
    },
  },
} as const;
