import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { axiosClient } from '@/utils/axiosClient';
import { toast } from 'sonner';

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  photo: string;
  email?: string;
  phone?: string;
}

const Team = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await axiosClient.get('/team');
      setMembers(response.data);
    } catch (error) {
      toast.error('Failed to fetch team members');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team</h1>
            <p className="text-muted-foreground">Manage your team members</p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted" />
                  <div className="mx-auto mb-2 h-4 w-32 rounded bg-muted" />
                  <div className="mx-auto h-3 w-24 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : members.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No team members yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => (
              <Card key={member._id}>
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-muted">
                    {member.photo && (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Team;
