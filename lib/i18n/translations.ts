export type Language = 'en' | 'pt';

export const translations = {
    en: {
        // Navigation
        nav_dashboard: 'Dashboard',
        nav_my_card: 'My Card',
        nav_matchday: 'Matchday',
        nav_my_team: 'My Team',
        nav_discovery: 'Discovery',
        nav_profile: 'Profile',
        nav_sign_out: 'Sign Out',
        nav_fan_view: 'Fan View',
        nav_admin_login: 'Admin Login',
        nav_fixtures: 'Fixtures',
        nav_standings: 'Standings',
        nav_teams: 'Teams',
        nav_players: 'Players',
        nav_invites: 'Invites',
        nav_matches: 'Matches',
        nav_venues: 'Venues',
        nav_referee: 'Referee',
        nav_analytics: 'Analytics',
        nav_categories: 'Categories',
        nav_settings: 'Settings',
        nav_scoreboard: 'Scoreboard',
        nav_statistics: 'Statistics',

        // Common buttons
        btn_save: 'Save Changes',
        btn_cancel: 'Cancel',
        btn_edit: 'Edit',
        btn_delete: 'Delete',
        btn_confirm: 'Confirm',
        btn_back: 'Back',
        btn_next: 'Next',
        btn_submit: 'Submit',
        btn_upload: 'Upload',
        btn_view: 'View',
        btn_manage: 'Manage',

        // Player profile
        profile_title: 'MY PROFILE',
        profile_subtitle: 'Personal Profile',
        profile_description: 'Manage your player details and squad registration info.',
        profile_identity_label: 'Identity',
        profile_full_name: 'Full Display Name',
        profile_position: 'Primary Position',
        profile_jersey: 'Jersey Number',
        profile_nationality: 'Nationality',
        profile_bio: 'Personal Bio',
        profile_whatsapp_section: 'WhatsApp Alerts',
        profile_whatsapp_number: 'WhatsApp Number',
        profile_whatsapp_placeholder: 'e.g. +5511999999999',
        profile_whatsapp_hint: 'International format — include country code',
        profile_whatsapp_optin: 'Receive WhatsApp alerts for my matches',
        profile_whatsapp_optin_desc:
            'Get notified when your match starts, goals are scored, or the final whistle blows.',

        // Discovery
        discovery_no_teams: 'No teams recruiting',
        discovery_find_team: 'Find a Team',

        // Dashboard
        dashboard_title: 'Dashboard',
        dashboard_empty: 'Nothing to show yet.',

        // Misc
        privacy_manage: 'Manage Privacy',
        scouting_status: 'Scouting Status',
        public_profile: 'Public Profile Visibility',
    },
    pt: {
        // Navigation
        nav_dashboard: 'Painel',
        nav_my_card: 'Meu Cartão',
        nav_matchday: 'Dia do Jogo',
        nav_my_team: 'Meu Time',
        nav_discovery: 'Descoberta',
        nav_profile: 'Perfil',
        nav_sign_out: 'Sair',
        nav_fan_view: 'Visão do Torcedor',
        nav_admin_login: 'Login Admin',
        nav_fixtures: 'Jogos',
        nav_standings: 'Classificação',
        nav_teams: 'Times',
        nav_players: 'Jogadores',
        nav_invites: 'Convites',
        nav_matches: 'Partidas',
        nav_venues: 'Locais',
        nav_referee: 'Árbitro',
        nav_analytics: 'Análises',
        nav_categories: 'Categorias',
        nav_settings: 'Configurações',
        nav_scoreboard: 'Placar',
        nav_statistics: 'Estatísticas',

        // Common buttons
        btn_save: 'Salvar',
        btn_cancel: 'Cancelar',
        btn_edit: 'Editar',
        btn_delete: 'Excluir',
        btn_confirm: 'Confirmar',
        btn_back: 'Voltar',
        btn_next: 'Próximo',
        btn_submit: 'Enviar',
        btn_upload: 'Enviar Arquivo',
        btn_view: 'Ver',
        btn_manage: 'Gerenciar',

        // Player profile
        profile_title: 'MEU PERFIL',
        profile_subtitle: 'Perfil Pessoal',
        profile_description: 'Gerencie seus dados de jogador e informações de registro.',
        profile_identity_label: 'Identidade',
        profile_full_name: 'Nome Completo',
        profile_position: 'Posição Principal',
        profile_jersey: 'Número da Camisa',
        profile_nationality: 'Nacionalidade',
        profile_bio: 'Bio Pessoal',
        profile_whatsapp_section: 'Alertas por WhatsApp',
        profile_whatsapp_number: 'Número do WhatsApp',
        profile_whatsapp_placeholder: 'ex. +5511999999999',
        profile_whatsapp_hint: 'Formato internacional — inclua o código do país',
        profile_whatsapp_optin: 'Receber alertas de WhatsApp para minhas partidas',
        profile_whatsapp_optin_desc:
            'Seja notificado quando sua partida começar, gols forem marcados ou o apito final soar.',

        // Discovery
        discovery_no_teams: 'Nenhum time recrutando',
        discovery_find_team: 'Encontrar Time',

        // Dashboard
        dashboard_title: 'Painel',
        dashboard_empty: 'Nada para mostrar ainda.',

        // Misc
        privacy_manage: 'Gerenciar Privacidade',
        scouting_status: 'Status de Recrutamento',
        public_profile: 'Visibilidade do Perfil Público',
    },
} as const;

export type TranslationKey = keyof (typeof translations)['en'];
