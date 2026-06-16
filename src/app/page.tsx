import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">🏥 HU Clinic</CardTitle>
          <CardDescription>
            Dinámica colaborativa para revisar la descomposición de Historias de Usuario en tareas
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Link href="/create">
            <Button className="w-full" size="lg">Crear sala</Button>
          </Link>
          <Link href="/join">
            <Button className="w-full" variant="outline" size="lg">Unirse a sala</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
