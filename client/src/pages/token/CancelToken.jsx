import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
// ponytail: cancel token page per counter_level_checkin_no_show_queue_policy.md
export default function CancelToken() {
  const [done, setDone] = useState(false);
  return (
    <MainLayout>
      <Card className="max-w-md mx-auto mt-10">
        <h2>Cancel Token</h2>
        <Button onClick={() => { setDone(true); }}>Confirm Cancel</Button>
        {done && <p>Cancelled.</p>}
      </Card>
    </MainLayout>
  );
}
