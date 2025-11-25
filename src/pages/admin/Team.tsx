import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { teamService, type TeamMember } from "@/services/firestore/team";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminTeam = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const data = await teamService.getAll();
      setMembers(data);
    } catch (error) {
      toast.error("Failed to fetch team members");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await teamService.delete(id);
      toast.success("Team member deleted successfully");
      fetchTeam(); // Refresh the list
    } catch (error) {
      toast.error("Failed to delete team member");
      console.error(error);
    } finally {
      setDeletingId(null);
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
          <Button onClick={() => navigate("/admin/add-team-member")}>
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full bg-muted border-4 border-primary">
                      {member.photo ? (
                      <img src={member.photo} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <PlusCircle className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                    {member.bio && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{member.bio}</p>
                    )}
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/edit-team-member/${member.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingId === member.id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete {member.name} from the team. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => member.id && handleDelete(member.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminTeam;

