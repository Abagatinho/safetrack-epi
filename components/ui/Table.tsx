export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[36rem]">
        <thead>
          <tr className="border-b-2 border-graphite">
            {headers.map((h) => (
              <th key={h} className="label py-3 px-4 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
