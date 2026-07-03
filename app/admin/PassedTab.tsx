type Props = {
  players: any[];
  loading: boolean;
  onSelect: (player: any) => void;
};

export default function PassedTab({
  players,
  loading,
  onSelect,
}: Props) {
  if (loading) {
    return (
      <div className="p-4 bg-white rounded-xl">
        loading...
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl">
      <p className="mb-3 text-sm text-gray-500">
        Passed students
      </p>

      <div className="divide-y">
        {players.map((r, i) => {
          const player = r.players;

          return (
            <button
              key={i}
              onClick={() =>
                onSelect({
                  id: player.id,
                  name: player.name,
                  student_id: player.student_id,
                  phone: player.phone,
                  score: r.score,
                })
              }
              className="flex justify-between w-full py-3 text-left"
            >
              <span>{player.name}</span>
              <span className="text-xs text-gray-400">
                {r.score}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}