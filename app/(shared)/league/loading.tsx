export default function LeagueLoading() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-400">
                    Loading
                </p>
            </div>
        </div>
    );
}
